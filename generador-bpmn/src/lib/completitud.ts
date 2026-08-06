import type { Paso } from "@/lib/diagramas";

// Motor de reglas de completitud — Incremento 1 de F02
// (docs/BRECHA-MAPEA-VS-SPEC-F02.md, sección 5; spec original en
// sistemaaiprocess/sdd/features/F02/spec.md §3.2).
//
// Código puro y determinístico: recibe actores/pasos ya en memoria y
// devuelve la misma lista de huecos ante la misma entrada (CA-14). Nunca
// llama al LLM — la spec es explícita en que estas reglas las evalúa el
// código, no la IA (Artículo 3).
//
// Subset implementado en este incremento: A1, A2, A3, M1, M2, M3, E2, E3.
// NO implementadas (fuera de scope, ver BRECHA-MAPEA-VS-SPEC-F02.md §3):
// - E1/E1b: requieren campos de entradas/salidas por paso que no existen
//   hoy en el modelo `Paso`. Agregarlos es decisión de modelo de datos,
//   no de este motor.
// - M4 (>50 nodos) y A5 (sin sistema/documento de respaldo): quedan para
//   incremento 2, junto con el tope de tamaño.

export type SeveridadHueco = "bloqueante" | "pendiente" | "sugerencia";

export type ReglaHueco = "A1" | "A2" | "A3" | "M1" | "M2" | "M3" | "E2" | "E3";

export type Hueco = {
  regla: ReglaHueco;
  severidad: SeveridadHueco;
  mensaje: string;
  /** Paso al que se refiere el hueco, si aplica (M1 puede no tener uno). */
  pasoId?: string;
};

const TIPOS_ACTIVIDAD = ["tarea", "sistema"] as const;
const TIPOS_FIN = ["fin_ok", "fin_error"] as const;

/** Destinos declarados de un paso, filtrados a los que existen en
 * `pasosPorId`. Un id que no existe en el diagrama ("id fantasma") nunca
 * debe contar como alcanzado ni como punto de convergencia del BFS de
 * `alcanzablesDesde` (bug detectado por ARQUITECTO-IT en M3: dos ramas que
 * apuntan al mismo id fantasma "convergían" aunque ambas apuntaran a la
 * nada). La validación de que un id inexistente es en sí mismo un error de
 * datos queda para incremento 2 (regla de "destino inexistente"). */
function destinosDe(p: Paso, pasosPorId: Map<string, Paso>): string[] {
  if (p.tipo === "decision") {
    return [p.siguienteSi, p.siguienteNo].filter(
      (d): d is string => !!d && pasosPorId.has(d),
    );
  }
  if (TIPOS_FIN.includes(p.tipo as (typeof TIPOS_FIN)[number])) return [];
  return p.siguiente && pasosPorId.has(p.siguiente) ? [p.siguiente] : [];
}

/** BFS simple sobre el grafo de pasos a partir de un conjunto de ids de
 * partida. Devuelve el conjunto de ids alcanzados (incluye los de
 * partida). Los loops (volver a un paso anterior) son válidos en el
 * proceso — por eso se lleva un `visitados` para no recorrer en círculo. */
function alcanzablesDesde(startIds: string[], pasosPorId: Map<string, Paso>): Set<string> {
  const visitados = new Set<string>();
  const cola = [...startIds];
  while (cola.length > 0) {
    const id = cola.shift()!;
    if (visitados.has(id)) continue;
    const paso = pasosPorId.get(id);
    if (!paso) continue;
    visitados.add(id);
    for (const destino of destinosDe(paso, pasosPorId)) {
      if (!visitados.has(destino)) cola.push(destino);
    }
  }
  return visitados;
}

/**
 * Evalúa el subset de 8 reglas de completitud sobre un diagrama completo.
 * Determinístico: misma entrada → misma salida, siempre (CA-14).
 */
export function evaluarCompletitud(pasos: Paso[]): Hueco[] {
  const huecos: Hueco[] = [];
  const pasosPorId = new Map(pasos.map((p) => [p.id, p]));

  // ── A1 / A2 / A3 — reglas por actividad ──────────────────────────────
  //
  // Heurística intencionalmente simple, sin NLP: detectar "verbo sin
  // objeto" (A2) de "actividad sin acción" (A1) de forma robusta requiere
  // analizar la oración (ej. distinguir "Bodega" — sustantivo puro — de
  // "Firmar" — verbo válido de una palabra). Ese análisis está fuera del
  // alcance de este incremento (motor determinístico de código, no IA).
  // Se usa un proxy verificable y documentado:
  //   - A1 (bloqueante): texto vacío → no hay acción declarada en absoluto.
  //   - A2 (pendiente): texto de una sola palabra → hay una acción pero
  //     sin objeto declarado ("Revisar" ¿qué?).
  // Limitación conocida: un texto de una sola palabra que en realidad es
  // un sustantivo puro (el ejemplo "Bodega" de la spec) queda clasificado
  // como A2 (pendiente) en vez de A1 (bloqueante). Documentado para que
  // ARQUITECTO/metodólogo-bpm lo revise si hace falta más precisión.
  for (const p of pasos) {
    if (!TIPOS_ACTIVIDAD.includes(p.tipo as (typeof TIPOS_ACTIVIDAD)[number])) continue;

    const texto = p.texto.trim();
    if (texto === "") {
      huecos.push({
        regla: "A1",
        severidad: "bloqueante",
        mensaje: `El paso "${p.id}" no tiene una acción descrita.`,
        pasoId: p.id,
      });
    } else if (!texto.includes(" ")) {
      huecos.push({
        regla: "A2",
        severidad: "pendiente",
        mensaje: `El paso "${texto}" tiene un verbo sin objeto declarado.`,
        pasoId: p.id,
      });
    }

    if (!p.actor || !p.actor.trim()) {
      huecos.push({
        regla: "A3",
        severidad: "pendiente",
        mensaje: `El paso "${texto || p.id}" no tiene responsable asignado (queda en el carril "Por definir").`,
        pasoId: p.id,
      });
    }
  }
  // A3 también aplica a decisiones: alguien tiene que tomarlas.
  for (const p of pasos) {
    if (p.tipo === "decision" && (!p.actor || !p.actor.trim())) {
      huecos.push({
        regla: "A3",
        severidad: "pendiente",
        mensaje: `La decisión "${p.texto || p.id}" no tiene responsable asignado (queda en el carril "Por definir").`,
        pasoId: p.id,
      });
    }
  }

  // ── M1 — un solo inicio y un solo fin (7PMG G3) ──────────────────────
  const hayInicio = pasos.some((p) => p.tipo === "inicio");
  const hayFin = pasos.some((p) => TIPOS_FIN.includes(p.tipo as (typeof TIPOS_FIN)[number]));
  if (!hayInicio) {
    huecos.push({
      regla: "M1",
      severidad: "bloqueante",
      mensaje: "El diagrama no tiene un evento de inicio.",
    });
  }
  if (!hayFin) {
    huecos.push({
      regla: "M1",
      severidad: "bloqueante",
      mensaje: "El diagrama no tiene ningún evento de fin (fin_ok / fin_error).",
    });
  }

  // ── M2 — rama de compuerta sin condición ─────────────────────────────
  // En este modelo la "condición" de cada rama es el propio destino
  // Sí/No: una rama sin destino declarado es una decisión sin criterio
  // para esa rama (spec §3.2: "afirma que la decisión no tiene criterio").
  for (const p of pasos) {
    if (p.tipo !== "decision") continue;
    if (!p.siguienteSi) {
      huecos.push({
        regla: "M2",
        severidad: "bloqueante",
        mensaje: `La decisión "${p.texto || p.id}" no tiene destino para la rama "Sí".`,
        pasoId: p.id,
      });
    }
    if (!p.siguienteNo) {
      huecos.push({
        regla: "M2",
        severidad: "bloqueante",
        mensaje: `La decisión "${p.texto || p.id}" no tiene destino para la rama "No".`,
        pasoId: p.id,
      });
    }
  }

  // ── M3 — compuerta que abre y no cierra (7PMG G4) ────────────────────
  // Solo se evalúa cuando ambas ramas tienen destino (si falta una, ya
  // quedó cubierto por M2 y evaluar el cierre sería ruido redundante).
  // Heurística: la compuerta "cierra" si las dos ramas eventualmente
  // convergen en un mismo paso, o si cada una llega de forma independiente
  // a un evento de fin. Si ninguna de las dos condiciones se cumple, las
  // ramas quedan abiertas sin resolución — se marca pendiente.
  for (const p of pasos) {
    if (p.tipo !== "decision" || !p.siguienteSi || !p.siguienteNo) continue;

    const alcanzablesSi = alcanzablesDesde([p.siguienteSi], pasosPorId);
    const alcanzablesNo = alcanzablesDesde([p.siguienteNo], pasosPorId);

    const convergen = [...alcanzablesSi].some((id) => alcanzablesNo.has(id));
    const siLlegaAFin = [...alcanzablesSi].some(
      (id) => TIPOS_FIN.includes(pasosPorId.get(id)?.tipo as (typeof TIPOS_FIN)[number]),
    );
    const noLlegaAFin = [...alcanzablesNo].some(
      (id) => TIPOS_FIN.includes(pasosPorId.get(id)?.tipo as (typeof TIPOS_FIN)[number]),
    );

    if (!convergen && !(siLlegaAFin && noLlegaAFin)) {
      huecos.push({
        regla: "M3",
        severidad: "pendiente",
        mensaje: `La decisión "${p.texto || p.id}" abre dos ramas que nunca convergen ni llegan ambas a un fin.`,
        pasoId: p.id,
      });
    }
  }

  // ── E2 — actividad inalcanzable desde el inicio ──────────────────────
  // Si no hay inicio, M1 ya lo señala como bloqueante — evaluar
  // alcanzabilidad sin punto de partida marcaría todo el diagrama como
  // inalcanzable, que es ruido, no información nueva.
  if (hayInicio) {
    const idsInicio = pasos.filter((p) => p.tipo === "inicio").map((p) => p.id);
    const alcanzables = alcanzablesDesde(idsInicio, pasosPorId);
    for (const p of pasos) {
      if (!alcanzables.has(p.id)) {
        huecos.push({
          regla: "E2",
          severidad: "bloqueante",
          mensaje: `El paso "${p.texto || p.id}" es inalcanzable desde el inicio del proceso.`,
          pasoId: p.id,
        });
      }
    }
  }

  // ── E3 — actividad sin sucesor ni fin: callejón sin salida ───────────
  // Solo tarea/sistema: las decisiones sin rama ya quedan cubiertas por
  // M2, y los eventos de fin legítimamente no tienen destino.
  for (const p of pasos) {
    if (!TIPOS_ACTIVIDAD.includes(p.tipo as (typeof TIPOS_ACTIVIDAD)[number])) continue;
    if (!p.siguiente) {
      huecos.push({
        regla: "E3",
        severidad: "bloqueante",
        mensaje: `El paso "${p.texto || p.id}" no tiene un siguiente paso ni termina el proceso: es un callejón sin salida.`,
        pasoId: p.id,
      });
    }
  }

  return huecos;
}

export function tieneBloqueantes(huecos: Hueco[]): boolean {
  return huecos.some((h) => h.severidad === "bloqueante");
}

/** Pendiente O bloqueante: cualquiera de las dos impide exportar (spec
 * §3.2: "Lo que quede sin resolver aparece marcado... y bloquea la
 * exportación"; CA-12). Solo "sugerencia" no bloquea nada. */
export function tienePendientesSinResolver(huecos: Hueco[]): boolean {
  return huecos.some((h) => h.severidad === "bloqueante" || h.severidad === "pendiente");
}
