"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAppAccess, requireCreationAccess } from "@/lib/session";
import {
  TIPOS_PASO,
  parseActores,
  parsePasos,
  type Paso,
} from "@/lib/diagramas";
import { extraerProcesoDesdePrompt } from "@/lib/extraccion-llm";
import { registrarDiagramaDeTrial } from "@/lib/trial";
import type { Prisma } from "@prisma/client";

/** Diagrama del usuario autenticado, o null si no existe / no le pertenece. */
async function diagramaDelUsuario(id: string, userId: string) {
  return prisma.diagram.findFirst({ where: { id, userId } });
}

const metaSchema = z.object({
  cliente: z.string().trim().min(2, "Cliente requerido"),
  proceso: z.string().trim().min(2, "Proceso requerido"),
});

/** Estado del formulario de creación: errores por campo. */
export type FormState = { errors?: Record<string, string> };

/** Crea un diagrama vacío (sin actores ni pasos) para que Fase 2 (IA) o el
 * usuario lo llenen después. */
export async function crearDiagramaAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireCreationAccess();

  const parsed = metaSchema.safeParse({
    cliente: formData.get("cliente"),
    proceso: formData.get("proceso"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0] ?? "form")] = issue.message;
    }
    return { errors };
  }

  const diagrama = await prisma.diagram.create({
    data: {
      userId: user.id,
      cliente: parsed.data.cliente,
      proceso: parsed.data.proceso,
      actores: [],
      pasos: [],
    },
  });
  await registrarDiagramaDeTrial(user.id);

  redirect(`/diagramas/${diagrama.id}`);
}

const promptSchema = z.object({
  cliente: z.string().trim().min(2, "Cliente requerido"),
  proceso: z.string().trim().min(2, "Proceso requerido"),
  prompt: z
    .string()
    .trim()
    .min(20, "Describe el proceso con un poco más de detalle (mínimo 20 caracteres)"),
});

/** Crea un diagrama a partir de una descripción libre: llama al motor
 * prompt→JSON (Fase 2, ver docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md)
 * y guarda el resultado ya con actores/pasos poblados. Si el LLM dejó
 * "pending_questions" (dudas que no pudo inferir), se pasan por query string
 * al redirect para que la página del diagrama las muestre — no se persisten
 * en la BD porque son un aviso de una sola vez, no parte del modelo de
 * datos del diagrama. */
export async function generarDesdePromptAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireCreationAccess();

  const parsed = promptSchema.safeParse({
    cliente: formData.get("cliente"),
    proceso: formData.get("proceso"),
    prompt: formData.get("prompt"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0] ?? "form")] = issue.message;
    }
    return { errors };
  }

  let resultado;
  try {
    resultado = await extraerProcesoDesdePrompt(parsed.data.prompt);
  } catch (err) {
    return {
      errors: {
        prompt: err instanceof Error ? err.message : "No se pudo generar el diagrama. Intenta de nuevo.",
      },
    };
  }

  const diagrama = await prisma.diagram.create({
    data: {
      userId: user.id,
      cliente: parsed.data.cliente,
      proceso: parsed.data.proceso,
      actores: resultado.actores as Prisma.InputJsonValue,
      pasos: resultado.pasos as unknown as Prisma.InputJsonValue,
    },
  });
  await registrarDiagramaDeTrial(user.id);

  const destino =
    resultado.pendingQuestions.length > 0
      ? `/diagramas/${diagrama.id}?preguntas=${encodeURIComponent(JSON.stringify(resultado.pendingQuestions))}`
      : `/diagramas/${diagrama.id}`;

  redirect(destino);
}

/** Actualiza cliente/proceso de un diagrama existente. */
export async function actualizarMetaAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("diagramId") ?? "");
  const diagrama = await diagramaDelUsuario(id, user.id);
  if (!diagrama) redirect("/dashboard");

  const parsed = metaSchema.safeParse({
    cliente: formData.get("cliente"),
    proceso: formData.get("proceso"),
  });
  if (!parsed.success) return; // formulario básico: sin feedback de error acá

  await prisma.diagram.update({
    where: { id },
    data: { cliente: parsed.data.cliente, proceso: parsed.data.proceso },
  });

  revalidatePath(`/diagramas/${id}`);
}

/** Elimina el diagrama completo. */
export async function eliminarDiagramaAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("diagramId") ?? "");
  const diagrama = await diagramaDelUsuario(id, user.id);
  if (!diagrama) redirect("/dashboard");

  await prisma.diagram.delete({ where: { id } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// ─────────────────────────────────────────────────────────────
// Actores
// ─────────────────────────────────────────────────────────────

export async function agregarActorAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("diagramId") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const diagrama = await diagramaDelUsuario(id, user.id);
  if (!diagrama || !nombre) return;

  const actores = parseActores(diagrama.actores);
  if (actores.includes(nombre)) return;

  await prisma.diagram.update({
    where: { id },
    data: { actores: [...actores, nombre] as Prisma.InputJsonValue },
  });
  revalidatePath(`/diagramas/${id}`);
}

/** Quita un actor. Los pasos que lo tenían asignado quedan sin actor
 * (cadena vacía) — igual que en el prototipo original. */
export async function quitarActorAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("diagramId") ?? "");
  const nombre = String(formData.get("nombre") ?? "");
  const diagrama = await diagramaDelUsuario(id, user.id);
  if (!diagrama) return;

  const actores = parseActores(diagrama.actores).filter((a) => a !== nombre);
  const pasos = parsePasos(diagrama.pasos).map((p) =>
    p.actor === nombre ? { ...p, actor: actores[0] ?? "" } : p,
  );

  await prisma.diagram.update({
    where: { id },
    data: {
      actores: actores as Prisma.InputJsonValue,
      pasos: pasos as unknown as Prisma.InputJsonValue,
    },
  });
  revalidatePath(`/diagramas/${id}`);
}

// ─────────────────────────────────────────────────────────────
// Pasos
// ─────────────────────────────────────────────────────────────

const pasoFormSchema = z.object({
  actor: z.string(),
  tipo: z.enum(TIPOS_PASO),
  texto: z.string().trim(),
  siguiente: z.string().optional(),
  siguienteSi: z.string().optional(),
  siguienteNo: z.string().optional(),
});

/** Normaliza los campos de destino según el tipo: una decisión usa
 * siguienteSi/siguienteNo, cualquier otro tipo usa siguiente (o ninguno si
 * es un fin). Evita guardar campos de destino que no aplican al tipo. */
function normalizarDestinos(datos: z.infer<typeof pasoFormSchema>): Pick<
  Paso,
  "siguiente" | "siguienteSi" | "siguienteNo"
> {
  if (datos.tipo === "decision") {
    return { siguienteSi: datos.siguienteSi || undefined, siguienteNo: datos.siguienteNo || undefined };
  }
  if (datos.tipo === "fin_ok" || datos.tipo === "fin_error") {
    return {};
  }
  return { siguiente: datos.siguiente || undefined };
}

function leerPasoForm(formData: FormData) {
  return pasoFormSchema.safeParse({
    actor: formData.get("actor"),
    tipo: formData.get("tipo"),
    texto: formData.get("texto"),
    siguiente: formData.get("siguiente") || undefined,
    siguienteSi: formData.get("siguienteSi") || undefined,
    siguienteNo: formData.get("siguienteNo") || undefined,
  });
}

export async function agregarPasoAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("diagramId") ?? "");
  const diagrama = await diagramaDelUsuario(id, user.id);
  if (!diagrama) return;

  const parsed = leerPasoForm(formData);
  if (!parsed.success) return;

  const nuevo: Paso = {
    id: randomUUID(),
    actor: parsed.data.actor,
    tipo: parsed.data.tipo,
    texto: parsed.data.texto,
    ...normalizarDestinos(parsed.data),
  };

  const pasos = [...parsePasos(diagrama.pasos), nuevo];
  await prisma.diagram.update({
    where: { id },
    data: { pasos: pasos as unknown as Prisma.InputJsonValue },
  });
  revalidatePath(`/diagramas/${id}`);
}

export async function actualizarPasoAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("diagramId") ?? "");
  const pasoId = String(formData.get("pasoId") ?? "");
  const diagrama = await diagramaDelUsuario(id, user.id);
  if (!diagrama) return;

  const parsed = leerPasoForm(formData);
  if (!parsed.success) return;

  const pasos = parsePasos(diagrama.pasos).map((p) =>
    p.id === pasoId
      ? {
          ...p,
          actor: parsed.data.actor,
          tipo: parsed.data.tipo,
          texto: parsed.data.texto,
          siguiente: undefined,
          siguienteSi: undefined,
          siguienteNo: undefined,
          ...normalizarDestinos(parsed.data),
        }
      : p,
  );

  await prisma.diagram.update({
    where: { id },
    data: { pasos: pasos as unknown as Prisma.InputJsonValue },
  });
  revalidatePath(`/diagramas/${id}`);
}

/** Quita un paso y limpia las referencias de otros pasos que apuntaban a él
 * (mismo criterio que el prototipo: evita destinos rotos). */
export async function quitarPasoAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("diagramId") ?? "");
  const pasoId = String(formData.get("pasoId") ?? "");
  const diagrama = await diagramaDelUsuario(id, user.id);
  if (!diagrama) return;

  const pasos = parsePasos(diagrama.pasos)
    .filter((p) => p.id !== pasoId)
    .map((p) => ({
      ...p,
      siguiente: p.siguiente === pasoId ? undefined : p.siguiente,
      siguienteSi: p.siguienteSi === pasoId ? undefined : p.siguienteSi,
      siguienteNo: p.siguienteNo === pasoId ? undefined : p.siguienteNo,
    }));

  await prisma.diagram.update({
    where: { id },
    data: { pasos: pasos as unknown as Prisma.InputJsonValue },
  });
  revalidatePath(`/diagramas/${id}`);
}
