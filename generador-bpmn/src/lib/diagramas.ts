import { z } from "zod";

// Modelo de datos heredado del prototipo apps/generador-diagramas.html
// (ver docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md, sección 1). Un paso
// tiene un tipo fijo; según el tipo, usa "siguiente" (pasos lineales) o
// "siguienteSi"/"siguienteNo" (decisión). fin_ok/fin_error no tienen salida.

export const TIPOS_PASO = [
  "inicio",
  "tarea",
  "sistema",
  "decision",
  "fin_ok",
  "fin_error",
] as const;

export type TipoPaso = (typeof TIPOS_PASO)[number];

export const TIPO_LABEL: Record<TipoPaso, string> = {
  inicio: "Inicio",
  tarea: "Tarea (persona)",
  sistema: "Tarea (sistema)",
  decision: "Decisión",
  fin_ok: "Fin OK",
  fin_error: "Fin con error",
};

export type Paso = {
  id: string;
  actor: string;
  tipo: TipoPaso;
  texto: string;
  siguiente?: string;
  siguienteSi?: string;
  siguienteNo?: string;
};

export const pasoSchema = z.object({
  id: z.string().min(1),
  actor: z.string(),
  tipo: z.enum(TIPOS_PASO),
  texto: z.string(),
  siguiente: z.string().optional(),
  siguienteSi: z.string().optional(),
  siguienteNo: z.string().optional(),
});

/** Valida que actores/pasos leídos desde la BD (Json) tengan la forma esperada. */
export function parseActores(valor: unknown): string[] {
  const r = z.array(z.string()).safeParse(valor);
  return r.success ? r.data : [];
}

export function parsePasos(valor: unknown): Paso[] {
  const r = z.array(pasoSchema).safeParse(valor);
  return r.success ? (r.data as Paso[]) : [];
}
