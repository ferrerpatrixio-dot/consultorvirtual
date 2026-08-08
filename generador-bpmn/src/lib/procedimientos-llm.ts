import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { procedimientoSchema, type ProcedimientoContenido } from "@/lib/procedimientos";

// Nivel 4 de F02 — estructurador LLM del procedimiento (docs/DISENO-NIVELES-1-4-F02.md
// §6.2). Archivo NUEVO a propósito: no toca extraccion-llm.ts.
//
// Restricción central, no negociable: el LLM ESTRUCTURA, nunca INVENTA.
// El usuario describe en sus palabras cómo se hace el paso; el LLM lo pasa
// al schema de src/lib/procedimientos.ts. Cualquier dato que el usuario no
// haya dado (sistema, campo, umbral, monto, plazo, cargo) no se completa:
// va a "faltantes" como pregunta abierta. "Reformular ≠ agregar" — el LLM
// puede derivar "objetivo" del texto del paso + actor, "precondiciones" de
// "entradas", "resultadoEsperado" de "salidas" (ya existen en Paso), pero
// nada más nuevo.

const MODELO = process.env.CLAUDE_MODEL ?? "claude-sonnet-5";

export type ContextoPaso = {
  actor: string;
  texto: string;
  entradas?: string[];
  salidas?: string[];
  /** Textos de los pasos vecinos (anterior/siguiente), para dar contexto
   * de flujo sin pedirle al LLM que infiera nada del resto del proceso. */
  vecinos?: string[];
};

const SYSTEM_PROMPT = `Eres un asistente que ESTRUCTURA procedimientos operativos. No eres una fuente de información: sos un formateador. Tu única tarea es tomar lo que el usuario escribió sobre cómo se hace un paso de un proceso, y organizarlo en el esquema pedido.

### Regla central — no negociable

Si el usuario no describió cómo se hace un tramo, NO lo completes: agregalo a "faltantes" como pregunta abierta. Está PROHIBIDO inventar nombres de sistemas, campos, plazos, montos o cargos que el usuario no mencionó.

"Reformular no es agregar": SÍ podés...
- derivar "objetivo" a partir del texto del paso y el actor (ej. paso "Cotiza repuesto" + actor "Vendedor" → objetivo "Que el vendedor entregue una cotización al cliente").
- ordenar y numerar como "instrucciones" lo que el usuario ya describió, sin agregar pasos intermedios que no mencionó.
- usar "entradas"/"salidas" del contexto del paso (si vienen) como base de "precondiciones"/"resultadoEsperado".

NO podés...
- inventar qué sistema se usa si el usuario no lo dijo (ir a "faltantes": "¿En qué sistema se registra esto?").
- inventar un plazo, monto o umbral que el usuario no mencionó.
- inventar a quién se escala una excepción si el usuario no lo dijo.
- agregar pasos, herramientas o excepciones que no están en el texto del usuario.

### Esquema de salida

- "objetivo": una línea, para qué sirve este paso.
- "precondiciones": lista de strings, qué tiene que estar listo antes (puede quedar vacía).
- "instrucciones": lista de { "orden": number, "accion": string (imperativo), "herramienta": string opcional }. Al menos una.
- "resultadoEsperado": una línea, qué queda como resultado del paso.
- "excepciones": lista de { "situacion": string, "queHacer": string } (puede quedar vacía).
- "faltantes": lista de strings, preguntas abiertas sobre lo que el usuario no aportó y vos no completaste.

Responde únicamente con el JSON pedido, sin texto adicional ni bloques de código markdown.`;

const PROCEDIMIENTO_JSON_SCHEMA = {
  type: "object",
  properties: {
    objetivo: { type: "string" },
    precondiciones: { type: "array", items: { type: "string" } },
    instrucciones: {
      type: "array",
      items: {
        type: "object",
        properties: {
          orden: { type: "integer" },
          accion: { type: "string" },
          herramienta: { type: "string" },
        },
        required: ["orden", "accion", "herramienta"],
        additionalProperties: false,
      },
    },
    resultadoEsperado: { type: "string" },
    excepciones: {
      type: "array",
      items: {
        type: "object",
        properties: {
          situacion: { type: "string" },
          queHacer: { type: "string" },
        },
        required: ["situacion", "queHacer"],
        additionalProperties: false,
      },
    },
    faltantes: { type: "array", items: { type: "string" } },
  },
  required: ["objetivo", "precondiciones", "instrucciones", "resultadoEsperado", "excepciones", "faltantes"],
  additionalProperties: false,
} as const;

const respuestaLlmSchema = z.object({
  objetivo: z.string(),
  precondiciones: z.array(z.string()),
  instrucciones: z.array(
    z.object({
      orden: z.number().int(),
      accion: z.string(),
      herramienta: z.string(),
    }),
  ),
  resultadoEsperado: z.string(),
  excepciones: z.array(z.object({ situacion: z.string(), queHacer: z.string() })),
  faltantes: z.array(z.string()),
});

function construirPromptUsuario(contexto: ContextoPaso, promptUsuario: string): string {
  const lineas = [
    `Paso: "${contexto.texto}" (actor: ${contexto.actor || "sin actor"})`,
  ];
  if (contexto.entradas?.length) lineas.push(`Entradas declaradas: ${contexto.entradas.join(", ")}`);
  if (contexto.salidas?.length) lineas.push(`Salidas declaradas: ${contexto.salidas.join(", ")}`);
  if (contexto.vecinos?.length) lineas.push(`Pasos vecinos: ${contexto.vecinos.join(" / ")}`);
  lineas.push("");
  lineas.push("Cómo lo describió el usuario:");
  lineas.push(promptUsuario);
  return lineas.join("\n");
}

/**
 * Llama a la API de Claude para estructurar el texto libre del usuario en
 * el schema de procedimiento. Lanza un Error legible si falta la API key o
 * si la llamada falla — el caller (server action) es responsable de
 * mostrarlo al usuario.
 */
export async function estructurarProcedimiento(
  contexto: ContextoPaso,
  promptUsuario: string,
): Promise<ProcedimientoContenido> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "La generación con IA no está disponible: falta configurar ANTHROPIC_API_KEY en el servidor.",
    );
  }

  const client = new Anthropic({ apiKey });

  const resp = await client.messages.create({
    model: MODELO,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: PROCEDIMIENTO_JSON_SCHEMA },
    },
    messages: [{ role: "user", content: construirPromptUsuario(contexto, promptUsuario) }],
  });

  if (resp.stop_reason === "refusal") {
    throw new Error(
      "El modelo no pudo procesar esta descripción (rechazada por políticas de seguridad). Intenta reformularla.",
    );
  }

  const bloqueTexto = resp.content.find((b) => b.type === "text");
  if (!bloqueTexto || bloqueTexto.type !== "text") {
    throw new Error("El modelo no devolvió una respuesta con el procedimiento.");
  }

  let json: unknown;
  try {
    json = JSON.parse(bloqueTexto.text);
  } catch {
    throw new Error("El modelo devolvió una respuesta que no se pudo interpretar. Intenta de nuevo.");
  }

  const parsed = respuestaLlmSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("El modelo devolvió un procedimiento con un formato inesperado. Intenta de nuevo.");
  }

  // Saneo: herramienta vacía → undefined (el schema del dominio la tiene
  // opcional, el json_schema estricto la exige presente por eso pide
  // "required" con string vacío como valor válido).
  const contenido: ProcedimientoContenido = {
    objetivo: parsed.data.objetivo,
    precondiciones: parsed.data.precondiciones,
    instrucciones: parsed.data.instrucciones.map((i) => ({
      orden: i.orden,
      accion: i.accion,
      herramienta: i.herramienta || undefined,
    })),
    resultadoEsperado: parsed.data.resultadoEsperado,
    excepciones: parsed.data.excepciones,
    faltantes: parsed.data.faltantes,
  };

  const validado = procedimientoSchema.safeParse(contenido);
  if (!validado.success) {
    throw new Error("El modelo devolvió un procedimiento con un formato inesperado. Intenta de nuevo.");
  }

  return validado.data;
}
