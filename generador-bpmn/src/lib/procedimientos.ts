import { z } from "zod";
import type { Paso } from "@/lib/diagramas";

// Nivel 4 de F02 — Procedimientos (docs/DISENO-NIVELES-1-4-F02.md, Parte B).
// Lógica pura: schema del contenido estructurado, elegibilidad de pasos y
// cálculo de cobertura. Sin acceso a BD — mismo criterio que completitud.ts
// y valor.ts. NO se integra a evaluarCompletitud (§6.3 del diseño): esa
// función es pura y síncrona sobre Paso[], y saber qué pasos tienen
// procedimiento exige un query a la tabla Procedimiento.

export const procedimientoSchema = z.object({
  objetivo: z.string().min(1), // 1 línea: para qué sirve este paso
  precondiciones: z.array(z.string()).default([]), // qué tiene que estar listo antes
  instrucciones: z
    .array(
      z.object({
        orden: z.number().int().positive(),
        accion: z.string().min(1), // imperativo: "Abrí el módulo X"
        herramienta: z.string().optional(), // sistema/planilla/formulario
      }),
    )
    .min(1),
  resultadoEsperado: z.string().min(1),
  excepciones: z
    .array(
      z.object({
        situacion: z.string(),
        queHacer: z.string(),
      }),
    )
    .default([]),
  /// Lo que el usuario no aportó y el LLM se negó a inventar. Se muestra
  /// como pregunta abierta, igual que pendingQuestions en Nivel 2.
  faltantes: z.array(z.string()).default([]),
});

export type ProcedimientoContenido = z.infer<typeof procedimientoSchema>;

/** Valida `Procedimiento.contenido` leído desde la BD (Json). Un valor
 * corrupto o ausente devuelve null — el caller decide qué mostrar. */
export function parseContenidoProcedimiento(valor: unknown): ProcedimientoContenido | null {
  const r = procedimientoSchema.safeParse(valor);
  return r.success ? r.data : null;
}

/** Regla de elegibilidad (§6.1 del diseño): solo pasos "tarea"/"sistema"
 * tienen procedimiento operativo. "inicio"/"fin_ok"/"fin_error" no son
 * trabajo (marcas de flujo); "decision" no necesita instrucción operativa,
 * el criterio ya vive en el texto de la pregunta y en las ramas;
 * "subproceso" no lleva procedimiento propio — los suyos son los de los
 * pasos de su diagrama hijo. Función de server, no solo de UI: también
 * gobierna el batch (si se construye) y el cálculo de cobertura. */
export function elegiblePasoProcedimiento(paso: Pick<Paso, "tipo">): boolean {
  return paso.tipo === "tarea" || paso.tipo === "sistema";
}

export type Cobertura = {
  elegibles: number;
  conProcedimiento: number;
  faltantes: string[]; // pasoId[]
};

/** Cobertura de procedimientos sobre un diagrama: cuántos pasos elegibles
 * tienen procedimiento vigente (no soft-deleted). Informativo puro, nunca
 * `Hueco`, nunca bloquea export (§6.3 del diseño). `procedimientos` son las
 * filas de la tabla ya filtradas por diagramId (y deletedAt: null, filtro
 * del caller — esta función no lo asume, solo cuenta pasoId presentes). */
export function coberturaProcedimientos(
  pasos: Paso[],
  procedimientos: { pasoId: string }[],
): Cobertura {
  const idsConProcedimiento = new Set(procedimientos.map((p) => p.pasoId));
  const elegibles = pasos.filter(elegiblePasoProcedimiento);
  const faltantes = elegibles.filter((p) => !idsConProcedimiento.has(p.id)).map((p) => p.id);
  return {
    elegibles: elegibles.length,
    conProcedimiento: elegibles.length - faltantes.length,
    faltantes,
  };
}

/** Manual operativo del proceso en Markdown (§6.4 del diseño). Declara su
 * propia cobertura al inicio — nunca oculta el hueco: si faltan
 * procedimientos, los nombra por texto de paso, no solo el conteo. Pura,
 * sin acceso a BD: recibe los pasos y los procedimientos ya cargados
 * (contenido ya parseado, filtrados por diagrama y vigentes). */
export function generarManualMarkdown(
  proceso: string,
  pasos: Paso[],
  procedimientosPorPasoId: Map<string, ProcedimientoContenido>,
): string {
  const cobertura = coberturaProcedimientos(
    pasos,
    [...procedimientosPorPasoId.keys()].map((pasoId) => ({ pasoId })),
  );
  const pasosPorId = new Map(pasos.map((p) => [p.id, p]));

  const lineas: string[] = [];
  lineas.push(`# Manual operativo — ${proceso}`);
  lineas.push("");
  lineas.push(
    `**Cobertura:** documentados ${cobertura.conProcedimiento} de ${cobertura.elegibles} pasos.`,
  );
  if (cobertura.faltantes.length > 0) {
    lineas.push("");
    lineas.push("**Pasos sin procedimiento documentado:**");
    for (const pasoId of cobertura.faltantes) {
      const p = pasosPorId.get(pasoId);
      lineas.push(`- ${p ? p.texto || pasoId : pasoId}`);
    }
  }
  lineas.push("");
  lineas.push("---");

  for (const paso of pasos) {
    if (!elegiblePasoProcedimiento(paso)) continue;
    const contenido = procedimientosPorPasoId.get(paso.id);
    lineas.push("");
    lineas.push(`## ${paso.texto || paso.id}`);
    lineas.push(`*Responsable: ${paso.actor || "sin asignar"}*`);
    lineas.push("");
    if (!contenido) {
      lineas.push("_Sin procedimiento documentado todavía._");
      continue;
    }
    lineas.push(`**Objetivo:** ${contenido.objetivo}`);
    if (contenido.precondiciones.length > 0) {
      lineas.push("");
      lineas.push("**Precondiciones:**");
      for (const pre of contenido.precondiciones) lineas.push(`- ${pre}`);
    }
    lineas.push("");
    lineas.push("**Instrucciones:**");
    for (const instr of [...contenido.instrucciones].sort((a, b) => a.orden - b.orden)) {
      lineas.push(
        `${instr.orden}. ${instr.accion}${instr.herramienta ? ` (${instr.herramienta})` : ""}`,
      );
    }
    lineas.push("");
    lineas.push(`**Resultado esperado:** ${contenido.resultadoEsperado}`);
    if (contenido.excepciones.length > 0) {
      lineas.push("");
      lineas.push("**Excepciones:**");
      for (const exc of contenido.excepciones) lineas.push(`- Si ${exc.situacion}: ${exc.queHacer}`);
    }
    if (contenido.faltantes.length > 0) {
      lineas.push("");
      lineas.push("**Preguntas abiertas (no completadas):**");
      for (const f of contenido.faltantes) lineas.push(`- ${f}`);
    }
  }

  return lineas.join("\n") + "\n";
}
