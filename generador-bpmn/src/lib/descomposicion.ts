import { randomUUID } from "crypto";
import type { PrismaClient } from "@prisma/client";
import type { Paso } from "@/lib/diagramas";

// Incremento 2 de F02 — descomposición en subprocesos
// (docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md §3).
//
// Código puro y determinístico donde es posible (esRegionSESE,
// proponerCorte, construirCorte): mismo patrón que completitud.ts, sin
// LLM, testeable con casos fijos (CA-14 / spec Artículo 3). Las funciones
// que sí tocan BD (raizDe, contarDescendientes) están separadas porque
// implementan los topes estructurales del §6 riesgo 2, que sí requieren
// leer el árbol persistido.

/** Máximo de niveles de profundidad del árbol de descomposición (raíz =
 * nivel 0). Decisión de producto: aplica a todos los usuarios, no solo
 * trial (ver handoff de PMcoordinador, no está en el diseño de
 * ARQUITECTO-IT — él solo pedía "rechazar si nivel >= 3", este valor es
 * consistente con esa recomendación). */
export const TOPE_NIVELES = 3;

/** Máximo de subprocesos (nodos del árbol, sin contar la raíz) que puede
 * tener un proceso completo. Política de producto, no técnica. */
export const TOPE_SUBPROCESOS_POR_RAIZ = 20;

type Edge = { from: string; to: string };

function destinosDe(p: Paso): string[] {
  if (p.tipo === "decision") {
    return [p.siguienteSi, p.siguienteNo].filter((d): d is string => !!d);
  }
  if (p.tipo === "fin_ok" || p.tipo === "fin_error") return [];
  return p.siguiente ? [p.siguiente] : [];
}

function edgesDe(pasos: Paso[]): Edge[] {
  const ids = new Set(pasos.map((p) => p.id));
  const edges: Edge[] = [];
  for (const p of pasos) {
    for (const to of destinosDe(p)) {
      if (ids.has(to)) edges.push({ from: p.id, to });
    }
  }
  return edges;
}

/**
 * Un tramo es convertible en subproceso solo si es una región SESE (Single
 * Entry, Single Exit): exactamente un arco entra desde fuera de la región y
 * exactamente un arco sale hacia fuera. Es la restricción técnica que
 * manda sobre toda la propuesta de corte (diseño §3.1) — sin esto no hay
 * forma de reemplazar el tramo por un único `bpmn:CallActivity` (una sola
 * entrada, una sola salida) sin perder o inventar flujo.
 */
export function esRegionSESE(pasos: Paso[], pasoIds: string[]): boolean {
  if (pasoIds.length === 0) return false;
  const region = new Set(pasoIds);
  const idsValidos = new Set(pasos.map((p) => p.id));
  if (!pasoIds.every((id) => idsValidos.has(id))) return false;

  const edges = edgesDe(pasos);
  const entrantes = edges.filter((e) => !region.has(e.from) && region.has(e.to));
  const salientes = edges.filter((e) => region.has(e.from) && !region.has(e.to));
  return entrantes.length === 1 && salientes.length === 1;
}

export type PropuestaCorte = { pasoIds: string[]; actor: string };

/** Tramos contiguos (en el orden del array `pasos`, que es el orden de la
 * tabla/diagrama — ver moverPasoAction en (app)/actions.ts) de un mismo
 * actor. */
function tramosPorActorContiguo(pasos: Paso[]): { actor: string; start: number; end: number }[] {
  const tramos: { actor: string; start: number; end: number }[] = [];
  let i = 0;
  while (i < pasos.length) {
    let j = i;
    while (j + 1 < pasos.length && pasos[j + 1].actor === pasos[i].actor) j++;
    tramos.push({ actor: pasos[i].actor, start: i, end: j });
    i = j + 1;
  }
  return tramos;
}

/** Longitud mínima de un tramo proponible: un subproceso de 1 solo paso no
 * aporta nada (se reemplazaría un nodo por otro nodo) — juicio de
 * implementación, no está numerado en el diseño. */
const LARGO_MINIMO_TRAMO = 2;

/**
 * Propone un corte determinístico (Opción B del diseño §3.2): el tramo
 * contiguo del mismo actor, SESE, más largo. Si ningún tramo por actor
 * cumple SESE, cae a "el SESE más largo disponible en todo el diagrama".
 * Si tampoco hay ninguno, devuelve null (el caller debe ofrecer modo
 * manual — diseño §3.2, último párrafo).
 */
export function proponerCorte(pasos: Paso[]): PropuestaCorte | null {
  let mejor: PropuestaCorte | null = null;

  // 1) tramos contiguos de un mismo actor, todas las sub-regiones posibles
  // dentro de cada tramo (no solo el tramo completo: si el tramo entero no
  // es SESE, puede haber una sub-región interior que sí lo sea).
  for (const tramo of tramosPorActorContiguo(pasos)) {
    for (let a = tramo.start; a <= tramo.end; a++) {
      for (let b = a; b <= tramo.end; b++) {
        const candidato = pasos.slice(a, b + 1);
        if (candidato.length < LARGO_MINIMO_TRAMO) continue;
        const pasoIds = candidato.map((p) => p.id);
        if (!esRegionSESE(pasos, pasoIds)) continue;
        if (!mejor || pasoIds.length > mejor.pasoIds.length) {
          mejor = { pasoIds, actor: tramo.actor };
        }
      }
    }
  }
  if (mejor) return mejor;

  // 2) fallback: el tramo contiguo SESE más largo del diagrama entero, sin
  // restricción de actor (diseño §3.2: "cae a proponer el tramo SESE más
  // largo disponible").
  for (let a = 0; a < pasos.length; a++) {
    for (let b = a; b < pasos.length; b++) {
      const candidato = pasos.slice(a, b + 1);
      if (candidato.length < LARGO_MINIMO_TRAMO) continue;
      const pasoIds = candidato.map((p) => p.id);
      if (!esRegionSESE(pasos, pasoIds)) continue;
      if (!mejor || pasoIds.length > mejor.pasoIds.length) {
        mejor = { pasoIds, actor: "" };
      }
    }
  }
  return mejor;
}

export type ResultadoCorte = {
  pasosHijo: Paso[];
  actoresHijo: string[];
  pasosPadre: Paso[];
  /** El nuevo Paso "subproceso" insertado en el padre. `subprocesoDiagramId`
   * viaja vacío: el caller lo completa una vez que el `Diagram` hijo existe
   * (necesita el id que Prisma genera al crearlo). */
  nuevoNodo: Paso;
};

/**
 * Construye, en memoria y sin tocar BD, el resultado de cortar `pasoIds`
 * del diagrama padre hacia un subproceso (diseño §3.3, pasos 3-4). Pura y
 * determinística: el caller (server action) es responsable de validar
 * SESE antes de llamarla, de persistir en una `$transaction`, y de
 * completar `nuevoNodo.subprocesoDiagramId` con el id real del hijo.
 */
export function construirCorte(
  pasos: Paso[],
  pasoIds: string[],
  nombreSubproceso: string,
): ResultadoCorte {
  const idsTramo = new Set(pasoIds);
  // Orden real en el diagrama, no el orden en que vinieron los ids.
  const tramoPasos = pasos.filter((p) => idsTramo.has(p.id));
  const primero = tramoPasos[0];

  const inicioSintetico: Paso = {
    id: randomUUID(),
    actor: "",
    tipo: "inicio",
    texto: "Inicio",
    siguiente: primero.id,
  };
  const finSintetico: Paso = { id: randomUUID(), actor: "", tipo: "fin_ok", texto: "Fin" };

  const remapExterno = (destId?: string) =>
    destId && !idsTramo.has(destId) ? finSintetico.id : destId;

  const tramoRemapeado: Paso[] = tramoPasos.map((p) => {
    if (p.tipo === "decision") {
      return { ...p, siguienteSi: remapExterno(p.siguienteSi), siguienteNo: remapExterno(p.siguienteNo) };
    }
    if (p.tipo === "fin_ok" || p.tipo === "fin_error") return { ...p };
    return { ...p, siguiente: remapExterno(p.siguiente) };
  });

  const pasosHijo = [inicioSintetico, ...tramoRemapeado, finSintetico];
  const actoresHijo = [...new Set(tramoPasos.map((p) => p.actor).filter((a) => a.trim() !== ""))];

  // Destino externo original del tramo (antes de remapear): es el
  // `siguiente` del nuevo nodo "subproceso" en el padre.
  let salienteExterno: string | undefined;
  for (const p of tramoPasos) {
    for (const d of destinosDe(p)) {
      if (!idsTramo.has(d)) salienteExterno = d;
    }
  }

  // Actor dominante = el más frecuente en el tramo (empate: el primero que
  // aparece). Criterio simple, no está en el diseño — se documenta acá.
  const conteoActores = new Map<string, number>();
  for (const p of tramoPasos) conteoActores.set(p.actor, (conteoActores.get(p.actor) ?? 0) + 1);
  const actorDominante =
    [...conteoActores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? primero.actor;

  const nuevoNodo: Paso = {
    id: randomUUID(),
    actor: actorDominante,
    tipo: "subproceso",
    texto: nombreSubproceso,
    siguiente: salienteExterno,
    subprocesoDiagramId: "", // completado por el caller con el id real del hijo
  };

  const idxPrimero = pasos.findIndex((p) => p.id === primero.id);
  const pasosSinTramo = pasos.filter((p) => !idsTramo.has(p.id));
  const pasosRepunteados = pasosSinTramo.map((p) => ({
    ...p,
    siguiente: p.siguiente && idsTramo.has(p.siguiente) ? nuevoNodo.id : p.siguiente,
    siguienteSi: p.siguienteSi && idsTramo.has(p.siguienteSi) ? nuevoNodo.id : p.siguienteSi,
    siguienteNo: p.siguienteNo && idsTramo.has(p.siguienteNo) ? nuevoNodo.id : p.siguienteNo,
  }));
  const pasosPadre = [
    ...pasosRepunteados.slice(0, idxPrimero),
    nuevoNodo,
    ...pasosRepunteados.slice(idxPrimero),
  ];

  return { pasosHijo, actoresHijo, pasosPadre, nuevoNodo };
}

// ── Topes estructurales (requieren BD — §6 riesgo 2 del diseño) ─────────

type DiagramaMin = { id: string; parentDiagramId: string | null; nivel: number };

/** Sube por `parentDiagramId` hasta encontrar la raíz del árbol. Acotado
 * por TOPE_NIVELES + 1 saltos como máximo, así que nunca es una cadena
 * larga aunque hubiera datos corruptos. */
export async function raizDe(
  prisma: PrismaClient,
  diagramId: string,
): Promise<DiagramaMin> {
  let actual = await prisma.diagram.findUniqueOrThrow({
    where: { id: diagramId },
    select: { id: true, parentDiagramId: true, nivel: true },
  });
  while (actual.parentDiagramId) {
    actual = await prisma.diagram.findUniqueOrThrow({
      where: { id: actual.parentDiagramId },
      select: { id: true, parentDiagramId: true, nivel: true },
    });
  }
  return actual;
}

/** Cuenta todos los diagramas descendientes (subprocesos, a cualquier
 * profundidad) de una raíz, vía BFS por `parentDiagramId`. */
export async function contarDescendientes(prisma: PrismaClient, raizId: string): Promise<number> {
  let total = 0;
  let frontera = [raizId];
  while (frontera.length > 0) {
    const hijos = await prisma.diagram.findMany({
      where: { parentDiagramId: { in: frontera } },
      select: { id: true },
    });
    total += hijos.length;
    frontera = hijos.map((h) => h.id);
  }
  return total;
}
