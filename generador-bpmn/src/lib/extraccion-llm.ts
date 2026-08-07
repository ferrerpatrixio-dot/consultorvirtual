import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { TIPOS_PASO, pasoSchema, type Paso } from "@/lib/diagramas";

// Motor prompt→JSON (Fase 2). Convierte una descripción libre de un proceso
// en el mismo esquema plano que usa el editor manual (actor/tipo/texto/
// siguiente*), heredado del prototipo, más los tres campos tomados de la
// skill bpmn-architect que sí aportan valor a un producto de documentación
// de procesos: id (ya existía), lane (=actor, explícito para el LLM) y
// pending_questions (método socrático a nivel de diagrama). Se descarta a
// propósito lo que bpmn-architect trae para BPMN 2.0 ejecutable
// (technical_meta, retry_strategy, is_idempotent): este producto documenta
// procesos, no los automatiza. Ver docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md
// sección 1.

const MODELO = process.env.CLAUDE_MODEL ?? "claude-sonnet-5";

export type ResultadoExtraccion = {
  actores: string[];
  pasos: Paso[];
  pendingQuestions: string[];
};

// La regla 3 del SYSTEM_PROMPT pide que, al modelar una decisión de 3+
// salidas como cadena de compuertas binarias, el LLM declare ese supuesto
// en pending_questions en vez de aplicarlo en silencio (revisión del
// ANALISTA-PROCESOS-NEGOCIO sobre el caso de 3+ salidas). No es testeable
// con vitest — depende de que el modelo real siga la instrucción — así que
// no hay test unitario para esto; la verificación es manual/QA sobre
// respuestas reales del LLM.
const SYSTEM_PROMPT = `Eres un analista de procesos de negocio. Tu única tarea es leer la descripción en lenguaje natural de un proceso que te da el usuario y convertirla en un diagrama de flujo estructurado, en el formato JSON exacto que se te pide — sin diálogo, sin preguntas de vuelta al usuario: entregas el JSON final en una sola respuesta.

### Esquema de salida

- "actores": lista de los roles/áreas/sistemas que participan en el proceso (los carriles del diagrama). Usa nombres cortos y consistentes (ej. "Cliente", "Vendedor", "Sistema de Facturación").
- "pasos": lista ORDENADA de los pasos del proceso. Cada paso tiene:
  - "id": identificador corto y único, formato "p1", "p2", "p3"... en el mismo orden en que aparecen.
  - "actor": a cuál de los "actores" pertenece este paso (debe coincidir exactamente con un valor de la lista "actores").
  - "lane": igual al valor de "actor" (repetido a propósito, no lo cambies).
  - "tipo": uno de estos seis valores exactos:
    - "inicio" — el primer paso del proceso. Debe haber exactamente uno y debe ser el primer elemento de "pasos".
    - "tarea" — una acción que hace una persona.
    - "sistema" — una acción automática o de un sistema/software.
    - "decision" — un punto donde el flujo se bifurca en dos caminos (Sí/No).
    - "fin_ok" — un final exitoso del proceso (o de una rama).
    - "fin_error" — un final por rechazo, error o cancelación.
  - "texto": descripción breve del paso, en formato "Verbo + objeto" (ej. "Valida documentación", no "Se valida la documentación por parte del guardia").
  - "siguiente": el "id" del paso al que continúa el flujo. Úsalo en pasos de tipo "inicio", "tarea" o "sistema". Dado que el orden de "pasos" no conecta nodos automáticamente, SIEMPRE debes indicar aquí el "id" del siguiente paso real (incluye saltos y loops hacia atrás si el proceso los tiene). Dejar este campo vacío ("") solo si genuinamente no puedes determinar a dónde sigue — y en ese caso agrega la duda a "pending_questions".
  - "siguienteSi" / "siguienteNo": solo para pasos de tipo "decision". El "id" del paso al que va cada rama. Mismo criterio: vacío ("") solo si no se puede inferir, y explicado en "pending_questions".
  - Los pasos de tipo "fin_ok" y "fin_error" no tienen salida: deja "siguiente", "siguienteSi" y "siguienteNo" como cadena vacía ("").
  - Todo campo que no aplique al tipo de paso también debe ir como cadena vacía ("") — el esquema exige que los tres campos de destino estén siempre presentes.
- "pending_questions": lista de preguntas para el usuario, en español, una por cada punto donde tuviste que dejar un destino vacío por no poder inferirlo con confianza (ej. "¿A dónde va el flujo si el pago es rechazado?", "¿Quién es responsable de aprobar este paso?"). Si no hay ninguna duda, entrega una lista vacía.

### Reglas

1. **Nunca inventes una rama o un responsable que el texto no sugiere.** Si el usuario no dice qué pasa en un caso, deja el destino vacío y pregunta en "pending_questions" — no adivines.
2. El primer paso siempre es "inicio". Si el proceso tiene una única salida feliz, ciérrala con "fin_ok"; los rechazos, cancelaciones o errores se cierran con "fin_error".
3. Las decisiones son binarias (Sí/No). Si el texto describe una decisión con más de dos ramas, modélala como una cadena de decisiones binarias sucesivas. Cuando armes una de estas cadenas, agrega SIEMPRE una entrada a "pending_questions" declarando explícitamente cómo la modelaste y preguntando si falta algún resultado posible (ej. "Modelé '¿Tipo de solicitud?' como una secuencia de preguntas Sí/No con los resultados Urgente, Normal y Baja prioridad. ¿Falta algún resultado posible?") — es un supuesto tuyo (cómo partir la decisión en binarios), y la regla 1 (cero invenciones silenciosas) exige declararlo, no solo ejecutarlo.
4. Los loops (volver a un paso anterior) son válidos y esperados si el proceso real reintenta algo — no los evites, sigue las instrucciones del usuario.
5. No agregues pasos, actores, validaciones o pasos de resiliencia que el usuario no haya descrito (nada de reintentos, backoff, idempotencia — este producto documenta el proceso tal como es, no lo diseña para automatización).
6. Usa español, y mantén "texto" corto (idealmente menos de 8 palabras).
7. Responde únicamente con el JSON pedido, sin texto adicional ni bloques de código markdown.`;

const pasoJsonSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "ID corto y único del paso, ej: p1, p2, p3...",
    },
    actor: {
      type: "string",
      description: "Actor/carril responsable de este paso. Debe coincidir con un valor de 'actores'.",
    },
    lane: {
      type: "string",
      description: "Igual al valor de 'actor'.",
    },
    tipo: {
      type: "string",
      enum: [...TIPOS_PASO],
    },
    texto: {
      type: "string",
      description: "Descripción breve del paso (verbo + objeto).",
    },
    siguiente: {
      type: "string",
      description: "ID del siguiente paso (tipo inicio/tarea/sistema). Cadena vacía si no aplica o no se puede determinar.",
    },
    siguienteSi: {
      type: "string",
      description: "ID del paso si la decisión es 'Sí' (solo tipo decision). Cadena vacía si no aplica o no se puede determinar.",
    },
    siguienteNo: {
      type: "string",
      description: "ID del paso si la decisión es 'No' (solo tipo decision). Cadena vacía si no aplica o no se puede determinar.",
    },
  },
  required: ["id", "actor", "lane", "tipo", "texto", "siguiente", "siguienteSi", "siguienteNo"],
  additionalProperties: false,
} as const;

const EXTRACCION_JSON_SCHEMA = {
  type: "object",
  properties: {
    actores: {
      type: "array",
      items: { type: "string" },
      description: "Lista de actores/carriles que participan en el proceso.",
    },
    pasos: {
      type: "array",
      items: pasoJsonSchema,
      description: "Lista ordenada de los pasos del proceso.",
    },
    pending_questions: {
      type: "array",
      items: { type: "string" },
      description: "Preguntas al usuario cuando algo no quedó claro.",
    },
  },
  required: ["actores", "pasos", "pending_questions"],
  additionalProperties: false,
} as const;

const respuestaLlmSchema = z.object({
  actores: z.array(z.string()),
  pasos: z.array(
    z.object({
      id: z.string().min(1),
      actor: z.string(),
      lane: z.string(),
      tipo: z.enum(TIPOS_PASO),
      texto: z.string(),
      siguiente: z.string(),
      siguienteSi: z.string(),
      siguienteNo: z.string(),
    }),
  ),
  pending_questions: z.array(z.string()),
});

/**
 * Llama a la API de Claude para convertir una descripción libre de un
 * proceso en el esquema estructurado (actores/pasos) que usa el resto de la
 * app. Lanza un Error legible si falta la API key o si la llamada falla —
 * el caller (server action) es responsable de mostrarlo al usuario.
 */
export async function extraerProcesoDesdePrompt(
  descripcion: string,
): Promise<ResultadoExtraccion> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "La generación con IA no está disponible: falta configurar ANTHROPIC_API_KEY en el servidor.",
    );
  }

  const client = new Anthropic({ apiKey });

  const resp = await client.messages.create({
    model: MODELO,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: EXTRACCION_JSON_SCHEMA },
    },
    messages: [{ role: "user", content: descripcion }],
  });

  if (resp.stop_reason === "refusal") {
    throw new Error(
      "El modelo no pudo procesar esta descripción (rechazada por políticas de seguridad). Intenta reformularla.",
    );
  }

  const bloqueTexto = resp.content.find((b) => b.type === "text");
  if (!bloqueTexto || bloqueTexto.type !== "text") {
    throw new Error("El modelo no devolvió una respuesta con el diagrama.");
  }

  let json: unknown;
  try {
    json = JSON.parse(bloqueTexto.text);
  } catch {
    throw new Error("El modelo devolvió una respuesta que no se pudo interpretar. Intenta de nuevo.");
  }

  const parsed = respuestaLlmSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("El modelo devolvió un diagrama con un formato inesperado. Intenta de nuevo.");
  }

  return normalizarResultado(parsed.data);
}

/**
 * Convierte la salida cruda del LLM (donde los campos "vacíos" son "" por
 * requisito del JSON schema estricto) al tipo Paso de la app (campos
 * opcionales), y sanea referencias rotas: un "siguiente*" que apunte a un id
 * que no existe en la lista de pasos se descarta (en vez de dejar un enlace
 * roto en el diagrama) y se agrega una pregunta pendiente explicándolo.
 */
function normalizarResultado(datos: z.infer<typeof respuestaLlmSchema>): ResultadoExtraccion {
  const idsValidos = new Set(datos.pasos.map((p) => p.id));
  const preguntasAdicionales: string[] = [];

  const limpiarDestino = (
    origenTexto: string,
    campo: string,
    valor: string,
  ): string | undefined => {
    if (!valor) return undefined;
    if (idsValidos.has(valor)) return valor;
    preguntasAdicionales.push(
      `El paso "${origenTexto || "(sin texto)"}" apuntaba a un destino inválido en "${campo}" — revisa a dónde debería ir.`,
    );
    return undefined;
  };

  const pasos: Paso[] = datos.pasos.map((p) => {
    const candidato = {
      id: p.id,
      actor: p.actor,
      tipo: p.tipo,
      texto: p.texto,
      siguiente: limpiarDestino(p.texto, "siguiente", p.siguiente),
      siguienteSi: limpiarDestino(p.texto, "siguienteSi", p.siguienteSi),
      siguienteNo: limpiarDestino(p.texto, "siguienteNo", p.siguienteNo),
    };
    // Defensa adicional: valida contra el mismo schema que usa el resto de
    // la app (pasoSchema, en diagramas.ts) antes de confiar en el dato.
    const validado = pasoSchema.safeParse(candidato);
    return validado.success ? (validado.data as Paso) : candidato;
  });

  // Unión de actores declarados + actores realmente usados en pasos, para
  // que ningún paso quede en un carril que no existe (y por lo tanto no se
  // dibuje en ningún subgraph — ver mermaid-render.ts).
  const actores = Array.from(
    new Set([...datos.actores.map((a) => a.trim()).filter(Boolean), ...pasos.map((p) => p.actor).filter(Boolean)]),
  );

  return {
    actores,
    pasos,
    pendingQuestions: [...datos.pending_questions, ...preguntasAdicionales],
  };
}
