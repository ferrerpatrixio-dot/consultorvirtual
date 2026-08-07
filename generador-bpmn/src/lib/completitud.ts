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
// Incremento 2 (docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md) suma M4
// (tope de 50 nodos, G7). E1/E1b (entradas/salidas) quedan para cuando el
// LLM las extraiga — los campos ya existen en `Paso` pero las reglas no se
// construyen en este incremento (fuera del alcance pedido).
// NO implementada: A5 (sin sistema/documento de respaldo).
//
// Revisión de decisiones 3+ salidas del ANALISTA-PROCESOS-NEGOCIO suma dos
// reglas más (cadenas de compuertas binarias, patrón ya usado por el LLM
// para modelar 3+ resultados): M6 (ramas gemelas) y A6 (decisión sin
// redacción de pregunta). Se salta A5 a propósito porque ese código ya
// está reservado (no implementado) para otro concepto.

export type SeveridadHueco = "bloqueante" | "pendiente" | "sugerencia";

export type ReglaHueco =
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "A6"
  | "M1"
  | "M2"
  | "M3"
  | "M4"
  | "M5"
  | "M6"
  | "E2"
  | "E3";

export type Hueco = {
  regla: ReglaHueco;
  severidad: SeveridadHueco;
  mensaje: string;
  /** Paso al que se refiere el hueco, si aplica (M1 puede no tener uno). */
  pasoId?: string;
};

// A4 — actor genérico (QA-05, Incremento 3 §2.4): lista cerrada, comparación
// exacta (no `includes`) case-insensitive sobre el actor recortado. Exportada
// para que el ANALISTA pueda ampliarla sin tocar la lógica del motor.
export const ACTORES_GENERICOS = [
  "sistema",
  "el sistema",
  "area",
  "el area",
  "responsable",
  "el responsable",
  "encargado",
  "el encargado",
  "usuario",
  "el usuario",
  "otro",
  "varios",
  "n/a",
  "por definir",
] as const;

// Rango Unicode de diacríticos combinantes (U+0300–U+036F), usado para
// quitar acentos tras normalize("NFD"). Construido con fromCharCode en vez
// de un literal de rango en el código fuente para evitar ambigüedad de
// codificación entre editores/plataformas.
const RANGO_DIACRITICOS = new RegExp(
  "[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]",
  "g",
);

/** true si el actor (recortado, sin mayúsculas ni acentos) matchea EXACTO
 * alguno de los términos genéricos — "Sistema de Bodega" no matchea. */
function esActorGenerico(actor: string): boolean {
  const normalizado = actor.trim().toLowerCase().normalize("NFD").replace(RANGO_DIACRITICOS, "");
  return (ACTORES_GENERICOS as readonly string[]).includes(normalizado);
}

// "subproceso" cuenta como actividad para todo el resto del motor
// (alcanzabilidad, callejón sin salida, nombrado, actor) — diseño §1.1: "es
// un nodo de flujo normal ... se trata igual que una actividad".
const TIPOS_ACTIVIDAD = ["tarea", "sistema", "subproceso"] as const;
const TIPOS_FIN = ["fin_ok", "fin_error"] as const;

/** Umbral duro G7 (7PMG): sobre 50 nodos, la tasa de error documentada
 * supera el 50% (Mendling/Neumann/van der Aalst 2007). Cuenta solo nodos
 * (pasos), no arcos — verificado contra la fuente, ver diseño §2. */
export const UMBRAL_M4_NODOS = 50;
/** Aviso preventivo, no bloqueante: "vas por X nodos de 50" (diseño §2). */
export const UMBRAL_AVISO_NODOS = 40;

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
    } else if (esActorGenerico(p.actor)) {
      huecos.push({
        regla: "A4",
        severidad: "sugerencia",
        mensaje: `El responsable del paso "${texto || p.id}" es genérico ("${p.actor.trim()}"). Identifica el rol o el área concreta: es lo que permite después asignar la mejora a alguien.`,
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

  // M1 — unicidad (Incremento 3 §2.2, QA-13). `pendiente`, no `bloqueante`:
  // hay procesos con varios disparadores legítimos de inicio; el usuario
  // puede reconocer el hueco (§2.3) y seguir. Solo se marca fin_ok repetido
  // — un fin_ok + un fin_error juntos es modelado correcto (dos resultados
  // distintos) y no se marca.
  const cantidadInicios = pasos.filter((p) => p.tipo === "inicio").length;
  if (cantidadInicios > 1) {
    huecos.push({
      regla: "M1",
      severidad: "pendiente",
      mensaje: `El diagrama tiene ${cantidadInicios} eventos de inicio. Un proceso debería tener uno solo: si arranca por varias vías, modela un inicio único y las variantes como una decisión posterior.`,
    });
  }
  const cantidadFinOk = pasos.filter((p) => p.tipo === "fin_ok").length;
  if (cantidadFinOk > 1) {
    huecos.push({
      regla: "M1",
      severidad: "pendiente",
      mensaje: `El diagrama tiene ${cantidadFinOk} eventos de fin OK. Verifica que no sea el mismo fin dibujado dos veces.`,
    });
  }

  // ── M5 — destino inexistente (Incremento 3 §2.1) ─────────────────────
  // Bloqueante: no es "falta información", es "el dato es inválido" — un
  // id que no existe en `pasosPorId` es un error de datos, no una
  // heurística discutible. Se evalúa sobre los campos crudos del Paso, sin
  // pasar por `destinosDe()` (que filtra ids fantasma a propósito para el
  // BFS de M3 — ver su comentario). Un paso de decisión con las dos ramas
  // rotas genera dos huecos, uno por rama.
  for (const p of pasos) {
    if (p.tipo === "decision") {
      if (p.siguienteSi && !pasosPorId.has(p.siguienteSi)) {
        huecos.push({
          regla: "M5",
          severidad: "bloqueante",
          mensaje: `El paso "${p.texto || p.id}" apunta a un destino que ya no existe en el diagrama (rama "Sí").`,
          pasoId: p.id,
        });
      }
      if (p.siguienteNo && !pasosPorId.has(p.siguienteNo)) {
        huecos.push({
          regla: "M5",
          severidad: "bloqueante",
          mensaje: `El paso "${p.texto || p.id}" apunta a un destino que ya no existe en el diagrama (rama "No").`,
          pasoId: p.id,
        });
      }
    } else if (p.siguiente && !pasosPorId.has(p.siguiente)) {
      huecos.push({
        regla: "M5",
        severidad: "bloqueante",
        mensaje: `El paso "${p.texto || p.id}" apunta a un destino que ya no existe en el diagrama.`,
        pasoId: p.id,
      });
    }
  }

  // ── M4 — tope de tamaño (7PMG G7) ────────────────────────────────────
  // Cuenta por diagrama individual, no acumulado en el árbol de
  // subprocesos (diseño §2: contar el árbol invertiría el sentido de la
  // guía, que prescribe descomponer). `pendiente`, no `bloqueante`: la
  // spec §3.4 permite seguir con un diagrama único asumiendo la
  // advertencia — bloquear del todo cerraría esa puerta.
  if (pasos.length > UMBRAL_M4_NODOS) {
    huecos.push({
      regla: "M4",
      severidad: "pendiente",
      mensaje: `El diagrama tiene ${pasos.length} nodos (tope recomendado: ${UMBRAL_M4_NODOS}). Sobre 50 elementos, más de la mitad de los modelos contiene errores (Mendling et al., 2.000 modelos de industria). Se recomienda descomponer en subprocesos.`,
    });
  } else if (pasos.length > UMBRAL_AVISO_NODOS) {
    huecos.push({
      regla: "M4",
      severidad: "sugerencia",
      mensaje: `El diagrama tiene ${pasos.length} nodos, acercándose al tope recomendado de ${UMBRAL_M4_NODOS}.`,
    });
  }

  // ── M6 — ramas gemelas (decisión que no decide nada) ─────────────────
  // Si Sí y No apuntan al mismo destino, la decisión no bifurca el flujo:
  // suele pasar cuando el LLM modela una cadena de compuertas binarias para
  // 3+ resultados (regla 3 del prompt de extracción) y "estaciona"
  // temporalmente un resultado sin ubicar en la misma rama que otro.
  // `pendiente`, no bloqueante: es una señal a revisar, no un dato inválido
  // (M5 ya cubre destinos que directamente no existen).
  for (const p of pasos) {
    if (p.tipo !== "decision") continue;
    if (p.siguienteSi && p.siguienteSi === p.siguienteNo) {
      huecos.push({
        regla: "M6",
        severidad: "pendiente",
        mensaje: `La decisión "${p.texto || p.id}" no distingue Sí de No — ambas ramas van al mismo lugar.`,
        pasoId: p.id,
      });
    }
  }

  // ── A6 — decisión no redactada como pregunta ─────────────────────────
  // Heurística barata, sin NLP: el texto de una "decision" debería
  // contener "¿" (apertura de interrogación en español) — si no lo tiene,
  // probablemente sea un rótulo ("Estado del contrato") en vez de una
  // pregunta cerrada Sí/No ("¿El contrato está aprobado?"), ilegible para
  // el cliente que lee el diagrama. Limitación conocida: no valida que la
  // pregunta sea cerrada (Sí/No) ni que tenga sentido, solo que exista el
  // signo de apertura.
  for (const p of pasos) {
    if (p.tipo !== "decision") continue;
    const texto = p.texto.trim();
    if (texto !== "" && !texto.includes("¿")) {
      huecos.push({
        regla: "A6",
        severidad: "pendiente",
        mensaje: `La decisión "${texto}" no está redactada como pregunta (falta "¿"). Reformúlala como pregunta cerrada Sí/No, ej. "¿El contrato está aprobado?".`,
        pasoId: p.id,
      });
    }
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

/** Clave estable de un hueco, usada para el mecanismo de reconocimiento
 * (Incremento 3 §2.3). El motor es determinístico, así que la misma
 * condición produce siempre la misma clave — un hueco resuelto de verdad
 * simplemente deja de aparecer; su clave queda huérfana en el array de
 * reconocidos, sin efecto. */
export function claveHueco(h: Hueco): string {
  return `${h.regla}:${h.pasoId ?? "-"}`;
}

/** Pendiente sin reconocer, O bloqueante: cualquiera de las dos impide
 * exportar (spec §3.2: "Lo que quede sin resolver aparece marcado... y
 * bloquea la exportación"; CA-12). Solo "sugerencia" no bloquea nada.
 * `reconocidos` (Incremento 3 §2.3) son claves de huecos `pendiente` que el
 * usuario asumió a sabiendas para destrabar la exportación — nunca se
 * aplica a `bloqueante`, ese nivel no se puede reconocer. */
export function tienePendientesSinResolver(huecos: Hueco[], reconocidos: string[] = []): boolean {
  const set = new Set(reconocidos);
  return huecos.some(
    (h) => h.severidad === "bloqueante" || (h.severidad === "pendiente" && !set.has(claveHueco(h))),
  );
}
