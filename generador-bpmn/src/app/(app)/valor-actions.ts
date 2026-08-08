"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAppAccess, requireUser } from "@/lib/session";
import { evaluarAcceso, registrarMapaValorDeTrial, registrarDiagramaDeTrial } from "@/lib/trial";
import { marcarBorradoLogicoSubarbol } from "@/lib/versionado";
import { ALCANCES, macroprocesosSchema, type Macroproceso } from "@/lib/valor";
import { generarBorradorMapaValor } from "@/lib/valor-llm";
import type { Prisma } from "@prisma/client";

// Nivel 1 de F02 — Mapa de Valor (docs/DISENO-NIVELES-1-4-F02.md, Parte A).
// Server Actions separadas de src/app/(app)/actions.ts a propósito: son un
// dominio nuevo (ValueMap), no una extensión de Diagram.

/** Mapa de valor del usuario autenticado, o null si no existe / no le
 * pertenece. Mismo criterio que diagramaDelUsuario en actions.ts. */
async function mapaDelUsuario(id: string, userId: string) {
  return prisma.valueMap.findFirst({ where: { id, userId, deletedAt: null } });
}

/** Convierte la propuesta cruda del LLM (§3.1 del diseño: solo nombre,
 * categoria, descripcion) en Macroproceso completo: asigna ids ("m1..mN",
 * generados por el servidor, NUNCA por el LLM — mismo criterio que
 * normalizarResultado en extraccion-llm.ts), fuerza propuestoPorIa: true.
 * Código, no LLM (§3.2 del diseño). */
function sanearBorrador(
  propuestas: { nombre: string; categoria: Macroproceso["categoria"]; descripcion: string }[],
): Macroproceso[] {
  return propuestas.map((p, i) => ({
    id: `m${i + 1}`,
    nombre: p.nombre,
    categoria: p.categoria,
    descripcion: p.descripcion,
    propuestoPorIa: true,
  }));
}

export type ValorFormState = { error?: string; valueMapId?: string };

const generarSchema = z.object({
  cliente: z.string().trim().min(2, "Cliente requerido"),
  rubro: z.string().trim().min(2, "Describe el rubro con más detalle"),
  alcance: z.enum(ALCANCES),
});

/** Crea un ValueMap nuevo y genera su borrador LLM en el mismo paso — es la
 * pantalla de entrada de Nivel 1. Gating propio (§2.2): requireAppAccess +
 * puedeGenerarMapaValor (trialValueMapsCreated < 3), NO requireCreationAccess
 * — el mapa de valor no consume el cupo de diagramas raíz. */
export async function crearMapaValorAction(
  _prevState: ValorFormState,
  formData: FormData,
): Promise<ValorFormState> {
  const user = await requireAppAccess();

  const parsed = generarSchema.safeParse({
    cliente: formData.get("cliente"),
    rubro: formData.get("rubro"),
    alcance: formData.get("alcance") || "empresa",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const acceso = await evaluarAcceso(user.id);
  if (!acceso.puedeGenerarMapaValor) {
    return {
      error:
        "Ya generaste el máximo de borradores de mapa de valor en la versión de evaluación. Suscríbete para seguir generando.",
    };
  }

  let borrador;
  try {
    borrador = await generarBorradorMapaValor(parsed.data.rubro);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo generar el borrador." };
  }

  const macroprocesos = sanearBorrador(borrador.macroprocesos);
  const validado = macroprocesosSchema.safeParse(macroprocesos);
  if (!validado.success) {
    return { error: "El borrador generado no cumple el formato esperado. Intenta de nuevo." };
  }

  const mapa = await prisma.valueMap.create({
    data: {
      userId: user.id,
      cliente: parsed.data.cliente,
      rubro: parsed.data.rubro,
      alcance: parsed.data.alcance,
      macroprocesos: validado.data as unknown as Prisma.InputJsonValue,
      borradorLlm: validado.data as unknown as Prisma.InputJsonValue,
    },
  });
  await registrarMapaValorDeTrial(user.id);

  redirect(`/mapas/${mapa.id}`);
}

/** Regenera el borrador LLM de un mapa existente — pisa macroprocesos Y
 * borradorLlm, y vuelve a poner confirmadoAt en null (es un nuevo borrador,
 * no una edición). Mismo gating de tope que la creación. */
export async function regenerarBorradorAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("valueMapId") ?? "");
  const mapa = await mapaDelUsuario(id, user.id);
  if (!mapa) redirect("/dashboard");

  const acceso = await evaluarAcceso(user.id);
  if (!acceso.puedeGenerarMapaValor) {
    redirect(`/mapas/${id}?error=cupo-borrador-agotado`);
  }

  let borrador;
  try {
    borrador = await generarBorradorMapaValor(mapa.rubro);
  } catch {
    redirect(`/mapas/${id}?error=fallo-generacion`);
  }

  const macroprocesos = sanearBorrador(borrador.macroprocesos);
  const validado = macroprocesosSchema.safeParse(macroprocesos);
  if (!validado.success) {
    redirect(`/mapas/${id}?error=fallo-generacion`);
  }

  await prisma.valueMap.update({
    where: { id },
    data: {
      macroprocesos: validado.data as unknown as Prisma.InputJsonValue,
      borradorLlm: validado.data as unknown as Prisma.InputJsonValue,
      confirmadoAt: null,
    },
  });
  await registrarMapaValorDeTrial(user.id);

  revalidatePath(`/mapas/${id}`);
  redirect(`/mapas/${id}`);
}

/** Vuelve al borrador original del LLM (§1.2: "volver al borrador" sin
 * gastar otra llamada). No consume cupo — es local, sin LLM. */
export async function volverABorradorAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("valueMapId") ?? "");
  const mapa = await mapaDelUsuario(id, user.id);
  if (!mapa) redirect("/dashboard");

  await prisma.valueMap.update({
    where: { id },
    data: { macroprocesos: mapa.borradorLlm as Prisma.InputJsonValue, confirmadoAt: null },
  });
  revalidatePath(`/mapas/${id}`);
}

/** Guarda la edición completa de la grilla (agregar/quitar/reordenar/editar
 * macroprocesos). Recibe el array entero serializado — mismo patrón que
 * confirmarDiagramaGeneradoAction en actions.ts (no confía en el
 * round-trip: revalida con Zod). No gastar cupo: es edición local. Si el
 * mapa ya estaba confirmado y el usuario sigue editando, se mantiene
 * confirmado (editar después de confirmar no debería resetear el estado —
 * el usuario ya pasó por "Confirmar" una vez). */
export async function guardarMacroprocesosAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("valueMapId") ?? "");
  const mapa = await mapaDelUsuario(id, user.id);
  if (!mapa) redirect("/dashboard");

  let bruto: unknown;
  try {
    bruto = JSON.parse(String(formData.get("macroprocesosJson") ?? "[]"));
  } catch {
    redirect(`/mapas/${id}?error=edicion-invalida`);
  }

  const validado = macroprocesosSchema.safeParse(bruto);
  if (!validado.success) {
    redirect(`/mapas/${id}?error=edicion-invalida`);
  }

  await prisma.valueMap.update({
    where: { id },
    data: { macroprocesos: validado.data as unknown as Prisma.InputJsonValue },
  });
  revalidatePath(`/mapas/${id}`);
}

/** Confirma el mapa: el badge de "propuesta editable" (if sobre
 * confirmadoAt en toda la UI) desaparece, y bajarANivel2Action deja de
 * rechazar. Idempotente: confirmar dos veces no cambia la fecha. */
export async function confirmarMapaValorAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("valueMapId") ?? "");
  const mapa = await mapaDelUsuario(id, user.id);
  if (!mapa) redirect("/dashboard");
  if (mapa.confirmadoAt) {
    revalidatePath(`/mapas/${id}`);
    return;
  }

  await prisma.valueMap.update({ where: { id }, data: { confirmadoAt: new Date() } });
  revalidatePath(`/mapas/${id}`);
}

export type ResultadoBajarNivel = { error: string; cupoOcupado?: boolean } | { diagramId: string };

/** Baja de nivel: crea el Diagram raíz de Nivel 2 para el macroproceso
 * elegido, y escribe el enlace en ambos lados (§1.3 del diseño: Json como
 * fuente de verdad, Diagram.valueMapId/macroprocesoId como índice
 * denormalizado — se escriben en la misma $transaction). Rechaza si
 * confirmadoAt === null (§3.2: guarda de flujo en servidor, no solo UI). El
 * gating de slot rehacible (§2.3.1) lo aplica requireCreationAccess vía
 * evaluarAcceso — si el slot está ocupado, se devuelve cupoOcupado: true
 * para que la pantalla ofrezca "reemplazar" o "suscribirse" (el diálogo es
 * UX, el rechazo es del servidor, siempre). */
export async function bajarANivel2Action(
  valueMapId: string,
  macroprocesoId: string,
): Promise<ResultadoBajarNivel> {
  const user = await requireUser();
  const mapa = await mapaDelUsuario(valueMapId, user.id);
  if (!mapa) return { error: "Mapa de valor no encontrado." };

  if (!mapa.confirmadoAt) {
    return { error: "Confirma el mapa de valor antes de bajar a detallar un macroproceso." };
  }

  const macroprocesos = macroprocesosSchema.parse(mapa.macroprocesos);
  const macroproceso = macroprocesos.find((m) => m.id === macroprocesoId);
  if (!macroproceso) return { error: "Macroproceso no encontrado en este mapa." };
  if (macroproceso.diagramId) return { error: "Este macroproceso ya tiene un proceso detallado." };

  const acceso = await evaluarAcceso(user.id);
  if (!acceso.puedeUsarApp) redirect("/suscripcion?motivo=trial-vencido");
  if (!acceso.puedeCrearDiagrama) {
    return {
      error:
        "En la versión de evaluación se detalla un proceso a la vez. Reemplaza el que ya tienes o suscríbete para tener varios en simultáneo.",
      cupoOcupado: true,
    };
  }

  const diagramId = await prisma.$transaction(async (tx) => {
    const diagrama = await tx.diagram.create({
      data: {
        userId: user.id,
        cliente: mapa.cliente,
        proceso: macroproceso.nombre,
        actores: [],
        pasos: [],
        valueMapId: mapa.id,
        macroprocesoId: macroproceso.id,
      },
    });

    const macroprocesosActualizados = macroprocesos.map((m) =>
      m.id === macroprocesoId ? { ...m, diagramId: diagrama.id } : m,
    );
    await tx.valueMap.update({
      where: { id: mapa.id },
      data: { macroprocesos: macroprocesosActualizados as unknown as Prisma.InputJsonValue },
    });

    return diagrama.id;
  });

  await registrarDiagramaDeTrial(user.id);
  revalidatePath(`/mapas/${valueMapId}`);
  revalidatePath("/dashboard");
  return { diagramId };
}

/** Botón "Reemplazar" del diálogo de cupo ocupado (hallazgo DISEÑADOR-UX):
 * borra lógicamente el Diagram raíz que hoy ocupa el slot de trial y, en la
 * misma acción, vuelve a intentar bajarANivel2Action — sin que el usuario
 * navegue a /dashboard. Mismo criterio de "qué ocupa el slot" que
 * evaluarAcceso (userId, parentDiagramId: null, deletedAt: null). Si hubiera
 * más de una raíz activa (no debería pasar nunca dado el gating de
 * puedeCrearDiagrama, que solo permite 1), se toma la más reciente
 * (orderBy createdAt desc) como "la que ocupa el slot" — es la única
 * interpretación razonable sin más contexto de negocio. */
export async function reemplazarYDetallarAction(
  valueMapId: string,
  macroprocesoId: string,
): Promise<ResultadoBajarNivel> {
  const user = await requireUser();

  const raiz = await prisma.diagram.findFirst({
    where: { userId: user.id, parentDiagramId: null, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (raiz) {
    await prisma.$transaction(async (tx) => {
      await marcarBorradoLogicoSubarbol(tx, raiz.id);
    });
    revalidatePath("/dashboard");
  }

  return bajarANivel2Action(valueMapId, macroprocesoId);
}
