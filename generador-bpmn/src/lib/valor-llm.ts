import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { CATEGORIAS, type Categoria } from "@/lib/valor";

// Nivel 1 de F02 — borrador LLM del Mapa de Valor (docs/DISENO-NIVELES-1-4-F02.md
// §3.1). Archivo NUEVO a propósito: no toca extraccion-llm.ts (riesgo cero
// de regresión sobre la extracción de Nivel 2 que ya está en producción).
// Llamada barata comparada con esa: effort "low", max_tokens 1500 — la
// salida son ~10 objetos de dos campos, sin razonamiento de flujo.

const MODELO = process.env.CLAUDE_MODEL ?? "claude-sonnet-5";

export type MacroprocesoPropuesto = {
  nombre: string;
  categoria: Categoria;
  descripcion: string;
};

export type BorradorMapaValor = {
  macroprocesos: MacroprocesoPropuesto[];
  nota?: string;
};

// Regla 1 del prompt (§3.1): si el rubro es ambiguo, devolver la estructura
// mínima genérica y decirlo en "nota" — nunca inventar especificidad.
// Regla 3: fórmula de nomenclatura, copiada literal del diseño (tabla de
// conversiones few-shot incluida) — es texto de negocio validado por
// ANALISTA-PROCESOS-NEGOCIO, no se parafrasea.
const SYSTEM_PROMPT = `Eres un consultor de procesos de negocio. Tu única tarea es proponer, a partir del rubro de una empresa, un borrador de Mapa de Valor: la lista de macroprocesos típicos de ese rubro, agrupados en tres categorías. Es una PLANTILLA del rubro, no el mapa real de ninguna empresa concreta — el usuario la va a revisar y ajustar.

### Esquema de salida

- "macroprocesos": lista de objetos { "nombre", "categoria", "descripcion" }.
  - "categoria": una de "estrategico" | "core" | "soporte".
  - "nombre": el nombre del macroproceso (ver reglas de nomenclatura abajo).
  - "descripcion": una línea, qué abarca el macroproceso. Sin métricas, sin sistemas, sin nombres de personas — eso sería invención.
- "nota": opcional. Solo si el rubro es ambiguo o no lo reconoces: explica que devolviste la estructura mínima genérica.

### Reglas

1. Propone solo macroprocesos reconocibles del rubro declarado. Si el rubro es ambiguo o no se reconoce, devuelve la estructura mínima genérica (Ventas / Operaciones / Compras / Finanzas / Personas, repartida en las tres categorías) y decilo en "nota" — no inventes especificidad que el rubro no da.

2. Cantidades por categoría, no total: 3 a 5 "estrategico", 3 a 6 "core", 4 a 8 "soporte". Ninguna categoría vacía.

3. Nomenclatura obligatoria — fórmula "Sustantivo de Gestión + Objeto", de 3 a 6 palabras.
   - Sustantivos permitidos: Gestión, Dirección, Planificación, Administración, Diseño, Desarrollo, Control, Aseguramiento, Comercialización.
   - Prohibido: palabras sueltas, nombres de área o departamento, siglas, verbos en infinitivo, gerundios, y verbos de paso operativo ("Cotizar repuesto" es un paso de proceso, no un macroproceso).
   - Tabla de conversiones (ejemplos obligatorios de estilo):
     | No usar | Usar |
     |---|---|
     | Atracción | Gestión de mercadeo y generación de demanda |
     | Comercial / Ventas | Gestión comercial y de ventas |
     | Implementación | Gestión de la prestación del servicio |
     | Soporte | Gestión del servicio postventa |
     | Facturación y Cobranza | Gestión de facturación y cobranza |
     | RRHH | Gestión del talento humano |
     | TI / Sistemas | Gestión de tecnología de la información (son uno solo, fusionar) |
     | Legal | Gestión legal y de cumplimiento normativo |
     | Administrativo / Finanzas | Gestión financiera y administrativa |
     | Compras | Gestión de compras y proveedores |
     | Mantenimiento | Gestión de mantenimiento e infraestructura |
     | Proyectos | Gestión de proyectos |
     | Datos | Gestión de datos e información |
     | Mejora Continua | Gestión de la mejora continua |
     | Calidad | Gestión de la calidad |
     | Dirección | Direccionamiento estratégico |

4. Orden secuencial de los "core": listalos en secuencia real de operación, de izquierda a derecha — el primero es el primer contacto con el cliente, el último cierra el ciclo (habitualmente facturación y cobranza). Es una hipótesis tuya, el usuario la va a reordenar si hace falta.

5. "descripcion": una línea, qué abarca el macroproceso. Sin métricas, sin sistemas, sin nombres de personas.

6. Nunca describas el mapa como "el mapa de tu empresa". Es una plantilla del rubro.

7. Responde únicamente con el JSON pedido, sin texto adicional ni bloques de código markdown.`;

const MACROPROCESO_JSON_SCHEMA = {
  type: "object",
  properties: {
    nombre: { type: "string", description: "Nombre del macroproceso, fórmula 'Sustantivo de Gestión + Objeto'." },
    categoria: { type: "string", enum: [...CATEGORIAS] },
    descripcion: { type: "string", description: "Una línea, qué abarca el macroproceso." },
  },
  required: ["nombre", "categoria", "descripcion"],
  additionalProperties: false,
} as const;

const BORRADOR_JSON_SCHEMA = {
  type: "object",
  properties: {
    macroprocesos: {
      type: "array",
      items: MACROPROCESO_JSON_SCHEMA,
      description: "Lista de macroprocesos propuestos.",
    },
    nota: {
      type: "string",
      description: "Aclaración si el rubro es ambiguo y se usó la estructura genérica. Cadena vacía si no aplica.",
    },
  },
  required: ["macroprocesos", "nota"],
  additionalProperties: false,
} as const;

const respuestaLlmSchema = z.object({
  macroprocesos: z.array(
    z.object({
      nombre: z.string().min(1),
      categoria: z.enum(CATEGORIAS),
      descripcion: z.string(),
    }),
  ),
  nota: z.string(),
});

/**
 * Llama a la API de Claude para proponer un borrador de Mapa de Valor a
 * partir del rubro declarado. Lanza un Error legible si falta la API key o
 * si la llamada falla — el caller (server action) es responsable de
 * mostrarlo al usuario. El caller es también responsable de asignar ids,
 * forzar propuestoPorIa: true y confirmadoAt: null (§3.2 del diseño — eso
 * es dueño del código, no del LLM).
 */
export async function generarBorradorMapaValor(rubro: string): Promise<BorradorMapaValor> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "La generación con IA no está disponible: falta configurar ANTHROPIC_API_KEY en el servidor.",
    );
  }

  const client = new Anthropic({ apiKey });

  const resp = await client.messages.create({
    model: MODELO,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: BORRADOR_JSON_SCHEMA },
    },
    messages: [{ role: "user", content: `Rubro: ${rubro}` }],
  });

  if (resp.stop_reason === "refusal") {
    throw new Error(
      "El modelo no pudo procesar este rubro (rechazado por políticas de seguridad). Intenta reformularlo.",
    );
  }

  const bloqueTexto = resp.content.find((b) => b.type === "text");
  if (!bloqueTexto || bloqueTexto.type !== "text") {
    throw new Error("El modelo no devolvió una respuesta con el borrador.");
  }

  let json: unknown;
  try {
    json = JSON.parse(bloqueTexto.text);
  } catch {
    throw new Error("El modelo devolvió una respuesta que no se pudo interpretar. Intenta de nuevo.");
  }

  const parsed = respuestaLlmSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("El modelo devolvió un borrador con un formato inesperado. Intenta de nuevo.");
  }

  return {
    macroprocesos: parsed.data.macroprocesos,
    nota: parsed.data.nota || undefined,
  };
}
