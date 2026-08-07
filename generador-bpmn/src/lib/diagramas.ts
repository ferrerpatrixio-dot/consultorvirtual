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
  // Incremento 2 de F02 (docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md §1.1):
  // nodo que abre otro Diagram como subproceso. Tipo nuevo (no un campo
  // sobre "tarea") porque se dibuja distinto (ícono "+"), exporta a un
  // elemento BPMN distinto (bpmn:CallActivity) y el clic navega a otra
  // pantalla en vez de abrir el panel de edición.
  "subproceso",
] as const;

export type TipoPaso = (typeof TIPOS_PASO)[number];

export const TIPO_LABEL: Record<TipoPaso, string> = {
  inicio: "Inicio",
  tarea: "Tarea (persona)",
  sistema: "Tarea (sistema)",
  decision: "Decisión",
  fin_ok: "Fin OK",
  fin_error: "Fin con error",
  subproceso: "Subproceso",
};

export type Paso = {
  id: string;
  actor: string;
  tipo: TipoPaso;
  texto: string;
  siguiente?: string;
  siguienteSi?: string;
  siguienteNo?: string;
  /** Solo si tipo === "subproceso": id del Diagram que este nodo abre.
   * Fuente de verdad del enlace padre↔hijo (§1.2 del diseño); la columna
   * Diagram.parentDiagramId es un índice denormalizado de este dato. */
  subprocesoDiagramId?: string;
  /** E1/E1b (§1.4 del diseño): qué necesita/produce la actividad. Opcionales,
   * vacíos en todo diagrama existente antes de este incremento — el LLM no
   * las extrae todavía, se cargan a mano en el panel si el usuario quiere
   * habilitar la regla E1. */
  entradas?: string[];
  salidas?: string[];
};

export const pasoSchema = z
  .object({
    id: z.string().min(1),
    actor: z.string(),
    tipo: z.enum(TIPOS_PASO),
    texto: z.string(),
    siguiente: z.string().optional(),
    siguienteSi: z.string().optional(),
    siguienteNo: z.string().optional(),
    subprocesoDiagramId: z.string().optional(),
    entradas: z.array(z.string()).optional(),
    salidas: z.array(z.string()).optional(),
  })
  // Regla de integridad del diseño §1.1: tipo === "subproceso" ⟺
  // subprocesoDiagramId presente. Un paso "subproceso" sin enlace, o un
  // enlace en un paso que no es "subproceso", es un dato inválido.
  .superRefine((paso, ctx) => {
    const esSubproceso = paso.tipo === "subproceso";
    const tieneEnlace = !!paso.subprocesoDiagramId;
    if (esSubproceso !== tieneEnlace) {
      ctx.addIssue({
        code: "custom",
        path: ["subprocesoDiagramId"],
        message:
          'Un paso "subproceso" debe tener subprocesoDiagramId, y solo un paso "subproceso" puede tenerlo.',
      });
    }
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
