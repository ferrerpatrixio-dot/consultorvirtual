import { z } from "zod";

// Nivel 1 de F02 — Mapa de Valor (docs/DISENO-NIVELES-1-4-F02.md, Parte A).
// Lógica pura: schemas Zod, normalización de nombres, agrupamiento por
// categoría con orden estable, y revisarMapaValor (4 avisos informativos,
// nunca bloqueantes). Sin acceso a BD — igual criterio que completitud.ts.

export const CATEGORIAS = ["estrategico", "core", "soporte"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

/** Etiquetas visibles al usuario. El enum de arriba NO cambia: "core" es el
 *  valor técnico y es lo que viaja en el Json, en Zod y en el prompt. Lo que
 *  el usuario lee en pantalla es esto y solo esto — en ninguna pantalla,
 *  aviso ni export aparece la palabra "core". (Decisión de Patricio,
 *  2026-08-07: la etiqueta es "Del negocio", no "Core".) */
export const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  estrategico: "Estratégicos",
  core: "Del negocio",
  soporte: "De apoyo",
};

/** Alcance del mapa. Etiquetas de UI: "Empresa completa" / "Una unidad o
 *  área" / "Una sede". Solo "empresa" habilita los avisos V1/V3/V4. */
export const ALCANCES = ["empresa", "unidad", "sede"] as const;
export type Alcance = (typeof ALCANCES)[number];

export const ETIQUETAS_ALCANCE: Record<Alcance, string> = {
  empresa: "Empresa completa",
  unidad: "Una unidad o área",
  sede: "Una sede",
};

// Rango Unicode de diacríticos combinantes (U+0300–U+036F), usado para
// quitar acentos tras normalize("NFD"). Mismo criterio que
// completitud.ts (RANGO_DIACRITICOS) — se duplica a propósito acá en vez de
// exportarlo desde ahí: son dos dominios distintos (actores vs. nombres de
// macroproceso) que hoy comparten la fórmula de normalización por
// coincidencia, no por acoplamiento real.
const RANGO_DIACRITICOS = new RegExp(
  "[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]",
  "g",
);

/** Normaliza un nombre para comparar duplicados: recorta, minúsculas, sin
 *  acentos. "Gestión Comercial" y "gestion comercial " son el mismo nombre. */
export function normalizarNombre(nombre: string): string {
  return nombre.trim().toLowerCase().normalize("NFD").replace(RANGO_DIACRITICOS, "");
}

export const macroprocesoSchema = z.object({
  id: z.string().min(1), // "m1", "m2"... estable, no se reusa
  nombre: z.string().min(1).max(60),
  categoria: z.enum(CATEGORIAS),
  descripcion: z.string().max(200).default(""),
  /** Diagram de Nivel 2 que detalla este macroproceso. undefined = caja sin
   *  detallar todavía. */
  diagramId: z.string().optional(),
  /** true si vino del borrador LLM y el usuario no lo tocó. */
  propuestoPorIa: z.boolean().default(false),
});

export type Macroproceso = z.infer<typeof macroprocesoSchema>;

/** Límite duro por categoría — frena salida degenerada del LLM (un mapa de
 *  60 cajas o de 1), NO disciplina al usuario. Guía de prompt real:
 *  3-5 estratégico, 3-6 core, 4-8 soporte (§3.1 del diseño). */
const MIN_POR_CATEGORIA = 1;
const MAX_POR_CATEGORIA = 10;
const MAX_TOTAL = 25;

/** Valida la lista completa de macroprocesos que llega del borrador LLM o
 *  de la edición del usuario. Rechaza: categoría fuera de enum, nombre
 *  vacío/>60 chars, nombres duplicados (normalizados), cantidad por
 *  categoría fuera de [1,10] con tope global 25. NO valida la fórmula de
 *  nomenclatura — esa es regla del LLM (prompt), no del usuario (§3.1
 *  "DEV: esto es regla del LLM, NO del usuario"). */
export const macroprocesosSchema = z
  .array(macroprocesoSchema)
  .max(MAX_TOTAL, `Un mapa de valor no puede tener más de ${MAX_TOTAL} macroprocesos.`)
  .superRefine((lista, ctx) => {
    const vistos = new Map<string, number>();
    lista.forEach((m, idx) => {
      const clave = normalizarNombre(m.nombre);
      if (vistos.has(clave)) {
        ctx.addIssue({
          code: "custom",
          path: [idx, "nombre"],
          message: `Nombre duplicado: "${m.nombre}" ya existe en el mapa.`,
        });
      } else {
        vistos.set(clave, idx);
      }
    });

    for (const categoria of CATEGORIAS) {
      const cantidad = lista.filter((m) => m.categoria === categoria).length;
      if (cantidad > 0 && (cantidad < MIN_POR_CATEGORIA || cantidad > MAX_POR_CATEGORIA)) {
        ctx.addIssue({
          code: "custom",
          path: ["categoria"],
          message: `La categoría "${categoria}" tiene ${cantidad} macroprocesos; el rango permitido es ${MIN_POR_CATEGORIA}-${MAX_POR_CATEGORIA}.`,
        });
      }
    }
  });

/** Agrupa macroprocesos por categoría, PRESERVANDO el orden interno de cada
 *  grupo. Requisito, no detalle de implementación (§3.4 del diseño): el
 *  orden del array es dato real del usuario — cuál macroproceso es primer
 *  contacto con el cliente, cuál cierra el ciclo. Array.prototype.sort es
 *  estable por spec desde ES2019, así que basta con ordenar por categoría y
 *  no tocar nada más. NUNCA agregar un criterio de desempate (alfabético o
 *  cualquier otro): eso destruye el orden en silencio. */
export function agruparPorCategoria(
  macroprocesos: Macroproceso[],
): Record<Categoria, Macroproceso[]> {
  const indice: Record<Categoria, number> = { estrategico: 0, core: 1, soporte: 2 };
  const ordenados = [...macroprocesos].sort((a, b) => indice[a.categoria] - indice[b.categoria]);

  const resultado: Record<Categoria, Macroproceso[]> = { estrategico: [], core: [], soporte: [] };
  for (const m of ordenados) resultado[m.categoria].push(m);
  return resultado;
}

export type Aviso = {
  id: "V1" | "V2" | "V3" | "V4";
  mensaje: string;
};

/** Cuatro avisos informativos sobre el mapa de valor, ninguno bloqueante
 *  (§3.3 del diseño). V1/V3/V4 dependen del alcance: solo se emiten con
 *  alcance === "empresa" — exigir balance de cadena de valor completa a un
 *  recorte declarado (unidad/sede) es un falso positivo garantizado. V2
 *  (confirmó el borrador sin editar nada) aplica siempre.
 *
 *  Nunca lanza, nunca bloquea. Función pura y testeable, mismo criterio que
 *  evaluarCompletitud en completitud.ts. */
export function revisarMapaValor(macroprocesos: Macroproceso[], alcance: Alcance): Aviso[] {
  const avisos: Aviso[] = [];
  const gateEmpresa = alcance === "empresa";

  const porCategoria = agruparPorCategoria(macroprocesos);
  const cantidad: Record<Categoria, number> = {
    estrategico: porCategoria.estrategico.length,
    core: porCategoria.core.length,
    soporte: porCategoria.soporte.length,
  };

  // V1 — ningún macroproceso "core"
  if (gateEmpresa && cantidad.core === 0) {
    avisos.push({
      id: "V1",
      mensaje: "Falta el corazón del negocio: ¿qué hace tu empresa para el cliente?",
    });
  }

  // V2 — confirmó el borrador tal cual, sin editar nada. Aplica siempre.
  if (macroprocesos.length > 0 && macroprocesos.every((m) => m.propuestoPorIa)) {
    avisos.push({
      id: "V2",
      mensaje:
        "Confirmaste el borrador sin editarlo. Revisá que refleje tu empresa y no la plantilla del rubro.",
    });
  }

  // V3 — categoría vacía o con un solo elemento (estratégico o soporte)
  if (gateEmpresa) {
    if (cantidad.estrategico <= 1) {
      avisos.push({
        id: "V3",
        mensaje:
          cantidad.estrategico === 0
            ? "No registraste procesos estratégicos. ¿Quién define los objetivos y revisa los resultados?"
            : "Casi no registraste procesos estratégicos. ¿Quién define los objetivos y revisa los resultados?",
      });
    }
    if (cantidad.soporte <= 1) {
      avisos.push({
        id: "V3",
        mensaje:
          cantidad.soporte === 0
            ? "No registraste procesos de apoyo. ¿Quién se ocupa de la plata, la gente y los sistemas?"
            : "Casi no registraste procesos de apoyo. ¿Quién se ocupa de la plata, la gente y los sistemas?",
      });
    }
  }

  // V4 — una categoría domina con más del doble de la suma de las otras dos
  if (gateEmpresa) {
    for (const dominante of CATEGORIAS) {
      const otras = CATEGORIAS.filter((c) => c !== dominante).reduce((s, c) => s + cantidad[c], 0);
      if (cantidad[dominante] > otras * 2 && cantidad[dominante] > 0) {
        const etiqueta = ETIQUETAS_CATEGORIA[dominante];
        avisos.push({
          id: "V4",
          mensaje:
            dominante === "soporte"
              ? "Tenés muchos procesos de apoyo y pocos del negocio. ¿Seguro que así entregás valor a tu cliente?"
              : `Tenés muchos procesos "${etiqueta}" en comparación con el resto. ¿Seguro que así entregás valor a tu cliente?`,
        });
        break; // una sola categoría puede ser "la dominante" a la vez
      }
    }
  }

  return avisos;
}
