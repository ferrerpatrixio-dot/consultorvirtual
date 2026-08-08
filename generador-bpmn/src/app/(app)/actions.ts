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
  parseReconocidos,
  pasoSchema,
  type Paso,
} from "@/lib/diagramas";
import { extraerProcesoDesdePrompt } from "@/lib/extraccion-llm";
import { claveHueco, evaluarCompletitud, tieneBloqueantes, type Hueco } from "@/lib/completitud";
import { registrarDiagramaDeTrial } from "@/lib/trial";
import {
  esRegionSESE,
  construirCorte,
  raizDe,
  contarDescendientes,
  TOPE_NIVELES,
  TOPE_SUBPROCESOS_POR_RAIZ,
} from "@/lib/descomposicion";
import {
  mutarDiagramaVersionado,
  marcarBorradoLogicoSubarbol,
  revivirSubarbol,
  reconciliarSubprocesos,
  idsSubprocesoDePasos,
} from "@/lib/versionado";
import { elegiblePasoProcedimiento, procedimientoSchema } from "@/lib/procedimientos";
import { estructurarProcedimiento } from "@/lib/procedimientos-llm";
import type { Prisma } from "@prisma/client";

/** Diagrama del usuario autenticado, o null si no existe / no le pertenece.
 * Filtra `deletedAt: null` (§5.2a del diseño de versionado): un diagrama
 * con borrado lógico no debe ser editable ni visible por esta vía — solo
 * `restaurarVersionAction` puede revivirlo. */
async function diagramaDelUsuario(id: string, userId: string) {
  return prisma.diagram.findFirst({ where: { id, userId, deletedAt: null } });
}

const metaSchema = z.object({
  cliente: z.string().trim().min(2, "Cliente requerido"),
  proceso: z.string().trim().min(2, "Proceso requerido"),
});

/** Estado del formulario de creación: errores por campo. */
export type FormState = { errors?: Record<string, string>; revision?: RevisionGenerada };

/** Resultado transitorio de generarDesdePromptAction: NO se persiste en BD
 * hasta que el usuario confirma (spec F02 §3.1 "lista revisable" — ver
 * docs/BRECHA-MAPEA-VS-SPEC-F02.md incremento 1). Viaja de vuelta al
 * formulario dentro del FormState de useActionState; el propio formulario
 * lo re-envía como campos ocultos a confirmarDiagramaGeneradoAction. No
 * hay tabla de "borradores" ni sesión de servidor: es más barato que el
 * diagrama nunca sobreviva a un refresh de página que agregar
 * infraestructura nueva para un preliminar de un solo uso. */
export type RevisionGenerada = {
  cliente: string;
  proceso: string;
  actores: string[];
  pasos: Paso[];
  pendingQuestions: string[];
  huecos: Hueco[];
};

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
    .min(20, "Describe el proceso con un poco más de detalle (mínimo 20 caracteres)")
    .max(4000, "El texto no puede superar los 4.000 caracteres"),
});

/** Genera la lista revisable a partir de una descripción libre: llama al
 * motor prompt→JSON (Fase 2) y al motor de reglas de completitud
 * (src/lib/completitud.ts), pero NO persiste nada todavía (spec F02 §3.1:
 * "el sistema devuelve, antes de dibujar nada, una lista revisable...").
 * El resultado (actores, pasos, huecos por severidad) vuelve al formulario
 * para que el usuario lo revise; solo se guarda en BD cuando confirma vía
 * confirmarDiagramaGeneradoAction.
 *
 * Si hay algún hueco bloqueante, igual se devuelve la revisión completa
 * (con los huecos listados) — la spec exige mostrar exactamente qué falta
 * definir (CA-11), no ocultar la lista. Lo que el usuario no puede hacer
 * es confirmar mientras queden bloqueantes: eso lo valida
 * confirmarDiagramaGeneradoAction. */
export async function generarDesdePromptAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireCreationAccess();

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

  const huecos = evaluarCompletitud(resultado.pasos);

  return {
    revision: {
      cliente: parsed.data.cliente,
      proceso: parsed.data.proceso,
      actores: resultado.actores,
      pasos: resultado.pasos,
      pendingQuestions: resultado.pendingQuestions,
      huecos,
    },
  };
}

/** Persiste el diagrama de la lista revisable que el usuario acaba de
 * confirmar. Recibe actores/pasos serializados en campos ocultos del
 * formulario (ver RevisionGenerada) y NO confía en ese round-trip: valida
 * la forma con los mismos schemas que el resto de la app y recalcula los
 * huecos de completitud desde cero (CA-14, determinismo — y defensa ante
 * un payload manipulado). Si queda algún hueco bloqueante, rechaza guardar
 * (spec CA-11: "no se genera diagrama"). */
export async function confirmarDiagramaGeneradoAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireCreationAccess();

  const parsedMeta = metaSchema.safeParse({
    cliente: formData.get("cliente"),
    proceso: formData.get("proceso"),
  });
  if (!parsedMeta.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsedMeta.error.issues) {
      errors[String(issue.path[0] ?? "form")] = issue.message;
    }
    return { errors };
  }

  let actoresBrutos: unknown;
  let pasosBrutos: unknown;
  try {
    actoresBrutos = JSON.parse(String(formData.get("actoresJson") ?? "[]"));
    pasosBrutos = JSON.parse(String(formData.get("pasosJson") ?? "[]"));
  } catch {
    return { errors: { prompt: "La revisión expiró o es inválida. Genera el diagrama de nuevo." } };
  }

  const actores = parseActores(actoresBrutos);
  const pasosParseados = z.array(pasoSchema).safeParse(pasosBrutos);
  if (!pasosParseados.success || actores.length === 0 || pasosParseados.data.length === 0) {
    return { errors: { prompt: "La revisión expiró o es inválida. Genera el diagrama de nuevo." } };
  }
  const pasos = pasosParseados.data as Paso[];

  const huecos = evaluarCompletitud(pasos);
  if (tieneBloqueantes(huecos)) {
    return {
      errors: {
        prompt:
          "El diagrama todavía tiene puntos bloqueantes (ver la lista de abajo) — corrígelos antes de confirmar.",
      },
      revision: {
        cliente: parsedMeta.data.cliente,
        proceso: parsedMeta.data.proceso,
        actores,
        pasos,
        pendingQuestions: [],
        huecos,
      },
    };
  }

  const diagrama = await prisma.diagram.create({
    data: {
      userId: user.id,
      cliente: parsedMeta.data.cliente,
      proceso: parsedMeta.data.proceso,
      actores: actores as Prisma.InputJsonValue,
      pasos: pasos as unknown as Prisma.InputJsonValue,
    },
  });
  await registrarDiagramaDeTrial(user.id);

  const pendingQuestions = z
    .array(z.string())
    .safeParse(JSON.parse(String(formData.get("pendingQuestionsJson") ?? "[]")));

  const destino =
    pendingQuestions.success && pendingQuestions.data.length > 0
      ? `/diagramas/${diagrama.id}?preguntas=${encodeURIComponent(JSON.stringify(pendingQuestions.data))}`
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

  await prisma.$transaction((tx) =>
    mutarDiagramaVersionado(tx, diagrama, "editar_meta", undefined, {
      cliente: parsed.data.cliente,
      proceso: parsed.data.proceso,
    }),
  );

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

  await prisma.$transaction((tx) =>
    mutarDiagramaVersionado(tx, diagrama, "editar_actores", undefined, {
      actores: [...actores, nombre] as Prisma.InputJsonValue,
    }),
  );
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

  await prisma.$transaction((tx) =>
    mutarDiagramaVersionado(tx, diagrama, "editar_actores", undefined, {
      actores: actores as Prisma.InputJsonValue,
      pasos: pasos as unknown as Prisma.InputJsonValue,
    }),
  );
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

  // Nivel 4 de F02 (§5.3 regla 2 del diseño): el id de un paso nuevo tiene
  // que ser no reciclable para que un procedimiento soft-deleted nunca se
  // re-adjunte a un paso distinto que reutiliza el mismo pasoId.
  // randomUUID() ya cumple esto (colisión estadísticamente nula) — no hace
  // falta verificar contra procedimientos soft-deleted del diagrama.
  const nuevo: Paso = {
    id: randomUUID(),
    actor: parsed.data.actor,
    tipo: parsed.data.tipo,
    texto: parsed.data.texto,
    ...normalizarDestinos(parsed.data),
  };

  const pasos = [...parsePasos(diagrama.pasos), nuevo];
  await prisma.$transaction((tx) =>
    mutarDiagramaVersionado(tx, diagrama, "agregar_paso", nuevo.id, {
      pasos: pasos as unknown as Prisma.InputJsonValue,
    }),
  );
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

  await prisma.$transaction((tx) =>
    mutarDiagramaVersionado(tx, diagrama, "editar_paso", pasoId, {
      pasos: pasos as unknown as Prisma.InputJsonValue,
    }),
  );
  revalidatePath(`/diagramas/${id}`);
}

/** Mueve un paso una posición hacia arriba o abajo en el array (el orden del
 * array es el orden de la tabla y del diagrama — no hay campo de posición
 * separado en el schema). No hace nada si el paso ya está en el extremo. */
async function moverPaso(id: string, pasoId: string, userId: string, delta: 1 | -1) {
  const diagrama = await diagramaDelUsuario(id, userId);
  if (!diagrama) return;

  const pasos = parsePasos(diagrama.pasos);
  const idx = pasos.findIndex((p) => p.id === pasoId);
  const destino = idx + delta;
  if (idx === -1 || destino < 0 || destino >= pasos.length) return;

  [pasos[idx], pasos[destino]] = [pasos[destino], pasos[idx]];

  await prisma.$transaction((tx) =>
    mutarDiagramaVersionado(tx, diagrama, "mover_paso", pasoId, {
      pasos: pasos as unknown as Prisma.InputJsonValue,
    }),
  );
  revalidatePath(`/diagramas/${id}`);
}

export async function moverPasoArribaAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("diagramId") ?? "");
  const pasoId = String(formData.get("pasoId") ?? "");
  await moverPaso(id, pasoId, user.id, -1);
}

export async function moverPasoAbajoAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("diagramId") ?? "");
  const pasoId = String(formData.get("pasoId") ?? "");
  await moverPaso(id, pasoId, user.id, 1);
}

/** Quita un paso y limpia las referencias de otros pasos que apuntaban a él
 * (mismo criterio que el prototipo: evita destinos rotos).
 *
 * Incremento 2 de F02 (diseño §6 riesgo 3): si el paso es tipo
 * "subproceso", borrar solo el paso dejaría un `Diagram` hijo huérfano
 * (sin nadie que lo enlace, pero sin borrarse solo).
 *
 * Versionado (docs/DISENO-VERSIONADO-F02.md §5.2a): el hijo ya NO se borra
 * físicamente (`prisma.diagram.delete`) — se marca con borrado lógico junto
 * con todo su subárbol, para que `restaurarVersionAction` pueda revivirlo
 * si el usuario deshace este cambio. Se purga físicamente recién cuando
 * ninguna versión conservada del padre vuelve a mencionarlo (ver poda en
 * src/lib/versionado.ts). La confirmación de UI previa (QuitarPasoButton)
 * sigue siendo obligatoria e independiente de esto (§5.2c). */
export async function quitarPasoAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("diagramId") ?? "");
  const pasoId = String(formData.get("pasoId") ?? "");
  const diagrama = await diagramaDelUsuario(id, user.id);
  if (!diagrama) return;

  const pasosOriginales = parsePasos(diagrama.pasos);
  const pasoEliminado = pasosOriginales.find((p) => p.id === pasoId);

  const pasos = pasosOriginales
    .filter((p) => p.id !== pasoId)
    .map((p) => ({
      ...p,
      siguiente: p.siguiente === pasoId ? undefined : p.siguiente,
      siguienteSi: p.siguienteSi === pasoId ? undefined : p.siguienteSi,
      siguienteNo: p.siguienteNo === pasoId ? undefined : p.siguienteNo,
    }));

  await prisma.$transaction(async (tx) => {
    if (pasoEliminado?.tipo === "subproceso" && pasoEliminado.subprocesoDiagramId) {
      await marcarBorradoLogicoSubarbol(tx, pasoEliminado.subprocesoDiagramId);
    }
    // Nivel 4 de F02 (docs/DISENO-NIVELES-1-4-F02.md §5.3, regla 1):
    // soft-delete del procedimiento de ese pasoId, en la misma transacción
    // que la mutación versionada. No borrado físico: si el usuario restaura
    // una versión anterior que trae este pasoId de vuelta, el procedimiento
    // tiene que volver (ver reconciliación en restaurarVersionAction).
    await tx.procedimiento.updateMany({
      where: { diagramId: diagrama.id, pasoId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    await mutarDiagramaVersionado(tx, diagrama, "quitar_paso", pasoId, {
      pasos: pasos as unknown as Prisma.InputJsonValue,
    });
  });
  revalidatePath(`/diagramas/${id}`);
}

// ─────────────────────────────────────────────────────────────
// Reconocimiento de huecos pendientes (Incremento 3 de F02 §2.3)
// docs/DISENO-INCREMENTO-3-F02.md
// ─────────────────────────────────────────────────────────────

/** Marca un hueco `pendiente` como asumido por el usuario, para destrabar
 * la exportación (§2.3). No confía en la severidad que declare el
 * formulario: recalcula los huecos desde cero y solo agrega la clave si
 * corresponde a un hueco `pendiente` que existe hoy en el diagrama. Un
 * `bloqueante` (incluido M5) nunca se puede reconocer — regla dura, no
 * negociable (§2.3). */
export async function reconocerHuecoAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("diagramId") ?? "");
  const clave = String(formData.get("clave") ?? "");
  const diagrama = await diagramaDelUsuario(id, user.id);
  if (!diagrama || !clave) return;

  const pasos = parsePasos(diagrama.pasos);
  const huecos = evaluarCompletitud(pasos);
  const esPendienteValido = huecos.some((h) => h.severidad === "pendiente" && claveHueco(h) === clave);
  if (!esPendienteValido) return;

  const reconocidos = parseReconocidos(diagrama.huecosReconocidos);
  if (reconocidos.includes(clave)) return;

  await prisma.$transaction((tx) =>
    mutarDiagramaVersionado(tx, diagrama, "reconocer_hueco", clave, {
      huecosReconocidos: [...reconocidos, clave] as Prisma.InputJsonValue,
    }),
  );
  revalidatePath(`/diagramas/${id}`);
}

/** Revierte el reconocimiento de un hueco: vuelve a bloquear la
 * exportación si el hueco sigue presente. */
export async function desreconocerHuecoAction(formData: FormData) {
  const user = await requireAppAccess();
  const id = String(formData.get("diagramId") ?? "");
  const clave = String(formData.get("clave") ?? "");
  const diagrama = await diagramaDelUsuario(id, user.id);
  if (!diagrama || !clave) return;

  const reconocidos = parseReconocidos(diagrama.huecosReconocidos).filter((c) => c !== clave);

  await prisma.$transaction((tx) =>
    mutarDiagramaVersionado(tx, diagrama, "reconocer_hueco", clave, {
      huecosReconocidos: reconocidos as Prisma.InputJsonValue,
    }),
  );
  revalidatePath(`/diagramas/${id}`);
}

// ─────────────────────────────────────────────────────────────
// Descomposición en subprocesos (Incremento 2 de F02)
// docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md §3.3
// ─────────────────────────────────────────────────────────────

export type ResultadoDescomposicion = { error: string } | { hijoId: string };

/**
 * Corta `pasoIds` del diagrama `diagramId` hacia un nuevo `Diagram`
 * subproceso. Todo en una `$transaction`: si algo falla a mitad de camino
 * no queda ni el hijo creado ni el padre modificado.
 *
 * No usa `requireCreationAccess`: descomponer no consume el cupo de
 * trial (política de producto confirmada — los diagramas hijos no cuentan
 * como "diagrama creado" porque no generan una llamada nueva al LLM). Un
 * usuario en trial con el cupo ya usado puede seguir descomponiendo su
 * único diagrama.
 */
export async function descomponerEnSubprocesoAction(
  diagramId: string,
  pasoIds: string[],
  nombreSubproceso: string,
): Promise<ResultadoDescomposicion> {
  const user = await requireAppAccess();
  const padre = await diagramaDelUsuario(diagramId, user.id);
  if (!padre) return { error: "Diagrama no encontrado." };

  const nombre = nombreSubproceso.trim();
  if (!nombre) return { error: "El subproceso necesita un nombre." };

  const padrePasos = parsePasos(padre.pasos);
  const idsValidos = new Set(padrePasos.map((p) => p.id));
  if (pasoIds.length === 0 || !pasoIds.every((pid) => idsValidos.has(pid))) {
    return { error: "Selección de pasos inválida." };
  }
  if (!esRegionSESE(padrePasos, pasoIds)) {
    return {
      error:
        "El tramo seleccionado no tiene una única entrada y una única salida — no se puede convertir en subproceso.",
    };
  }
  if (padre.nivel >= TOPE_NIVELES) {
    return { error: `No se puede descomponer más allá de ${TOPE_NIVELES} niveles de profundidad.` };
  }

  const raiz = await raizDe(prisma, padre.id);
  const totalDescendientes = await contarDescendientes(prisma, raiz.id);
  if (totalDescendientes >= TOPE_SUBPROCESOS_POR_RAIZ) {
    return { error: `Este proceso ya alcanzó el máximo de ${TOPE_SUBPROCESOS_POR_RAIZ} subprocesos.` };
  }

  const corte = construirCorte(padrePasos, pasoIds, nombre);

  // Versionado (docs/DISENO-VERSIONADO-F02.md §1.2): pasosBackup se elimina
  // y se absorbe — el estado del padre previo al corte pasa a ser la
  // imagen previa de una DiagramVersion con operacion "descomponer", igual
  // que cualquier otra mutación. No se anida transacción (§2.2): se suma
  // adentro de la misma $transaction que ya traía esta acción.
  const hijoId = await prisma.$transaction(async (tx) => {
    const hijo = await tx.diagram.create({
      data: {
        userId: user.id,
        cliente: padre.cliente,
        proceso: nombre,
        actores: corte.actoresHijo as Prisma.InputJsonValue,
        pasos: corte.pasosHijo as unknown as Prisma.InputJsonValue,
        parentDiagramId: padre.id,
        parentPasoId: corte.nuevoNodo.id,
        nivel: padre.nivel + 1,
      },
    });

    // El nuevo nodo del padre solo puede saber el id real del hijo una vez
    // creado — se completa acá y recién entonces se persiste el padre.
    const pasosPadreFinal = corte.pasosPadre.map((p) =>
      p.id === corte.nuevoNodo.id ? { ...p, subprocesoDiagramId: hijo.id } : p,
    );

    await mutarDiagramaVersionado(tx, padre, "descomponer", nombre, {
      pasos: pasosPadreFinal as unknown as Prisma.InputJsonValue,
    });

    // Nivel 4 de F02 (§5.3 regla 3 del diseño — "el punto de integración
    // donde más fácil se pierde trabajo del usuario en silencio"): los
    // pasos que se mueven al hijo se llevan sus procedimientos.
    await tx.procedimiento.updateMany({
      where: { diagramId: padre.id, pasoId: { in: pasoIds } },
      data: { diagramId: hijo.id },
    });

    return hijo.id;
  });

  // Caso de QA obligatorio (pedido por PRODUCT MANAGER): crear una raíz en
  // trial gasta el cupo (registrarDiagramaDeTrial se llamó en
  // crearDiagramaAction/confirmarDiagramaGeneradoAction). Descomponer esa
  // raíz NO vuelve a llamar registrarDiagramaDeTrial acá — el cupo sigue
  // gastado (correcto, ya se gastó al crear la raíz) pero la descomposición
  // no requiere cupo adicional ni falla por falta de él. Ver
  // src/lib/descomposicion.test.ts para el caso de test end-to-end del
  // conteo (sin llamar a esta acción, que requiere BD).
  revalidatePath(`/diagramas/${padre.id}`);
  return { hijoId };
}

// ─────────────────────────────────────────────────────────────
// Versionado — historial y restaurar
// docs/DISENO-VERSIONADO-F02.md §3.1
// ─────────────────────────────────────────────────────────────

/**
 * Restaura `diagramId` al estado de `versionId`. Pieza de mayor riesgo de
 * datos del incremento (§6 del diseño) — no se recorta sin avisar:
 *
 * 1. Versiona el estado ACTUAL antes de pisar nada (operacion "restaurar",
 *    vía mutarDiagramaVersionado — nunca coalesce). Consecuencia: "deshacer
 *    el deshacer" sale gratis, es restaurar la versión recién creada.
 * 2. Reconcilia subprocesos comparando los `subprocesoDiagramId` de la
 *    versión destino (V) contra el estado actual (A) — ver
 *    reconciliarSubprocesos en src/lib/versionado.ts para la tabla de
 *    casos completa (§5.2b).
 * 3. Escribe actores/pasos/huecosReconocidos/cliente/proceso de la versión
 *    destino. Los huecos de completitud NO se guardan: se recalculan
 *    siempre en la página (CA-14, determinismo).
 *
 * Si algún subproceso quedó irrecuperable (purgado), los avisos viajan por
 * query string al volver a la página — mismo patrón que
 * generarDesdePromptAction usa para "preguntas" (no hay tabla de mensajes
 * transitorios, es más barato que sobreviva un solo redirect que agregar
 * infraestructura nueva). */
export async function restaurarVersionAction(formData: FormData): Promise<void> {
  const user = await requireAppAccess();
  const diagramId = String(formData.get("diagramId") ?? "");
  const versionId = String(formData.get("versionId") ?? "");

  const diagrama = await diagramaDelUsuario(diagramId, user.id);
  if (!diagrama) redirect("/dashboard");

  const version = await prisma.diagramVersion.findFirst({
    where: { id: versionId, diagramId },
  });
  if (!version) redirect(`/diagramas/${diagramId}`);

  const idsVersionDestino = idsSubprocesoDePasos(version.pasos);
  const idsEstadoActual = idsSubprocesoDePasos(diagrama.pasos);
  const idsAConsultar = [...new Set([...idsVersionDestino, ...idsEstadoActual])];

  const avisos: string[] = [];

  await prisma.$transaction(async (tx) => {
    const existentes = idsAConsultar.length
      ? await tx.diagram.findMany({
          where: { id: { in: idsAConsultar } },
          select: { id: true, deletedAt: true },
        })
      : [];
    const idsVivos = new Set(existentes.filter((d) => !d.deletedAt).map((d) => d.id));
    const idsBorrados = new Set(existentes.filter((d) => d.deletedAt).map((d) => d.id));

    const casos = reconciliarSubprocesos(idsVersionDestino, idsEstadoActual, idsVivos, idsBorrados);

    // Los subprocesos purgados físicamente (irrecuperables) se degradan a
    // "tarea" en el array de pasos que se va a escribir, conservando el
    // texto — nunca se deja un enlace colgante (§5.2b).
    const idsDegradados = new Set(
      casos.filter((c) => c.caso === "degradar").map((c) => c.subprocesoDiagramId),
    );
    const pasosDestino = parsePasos(version.pasos).map((p) => {
      if (p.tipo === "subproceso" && p.subprocesoDiagramId && idsDegradados.has(p.subprocesoDiagramId)) {
        avisos.push(
          `El subproceso «${p.texto}» ya no se puede recuperar; el paso quedó como actividad.`,
        );
        return { ...p, tipo: "tarea" as const, subprocesoDiagramId: undefined };
      }
      return p;
    });

    for (const caso of casos) {
      if (caso.caso === "revivir") await revivirSubarbol(tx, caso.subprocesoDiagramId);
      if (caso.caso === "borrado_logico") await marcarBorradoLogicoSubarbol(tx, caso.subprocesoDiagramId);
    }

    // Nivel 4 de F02 (§5.3 regla 1 del diseño): reconciliación simétrica de
    // procedimientos, mismo criterio que arriba con subprocesos. Los ids de
    // paso son no reciclables (randomUUID), así que "pasoId presente en la
    // versión destino" identifica sin ambigüedad al mismo paso que pudo
    // existir antes. Pasos que la versión destino trae de vuelta → revive
    // su procedimiento si estaba soft-deleted; pasos que la versión destino
    // NO tiene pero el estado actual sí → soft-delete de su procedimiento
    // (mismo efecto que si se hubiera quitado el paso).
    const idsPasoDestino = parsePasos(version.pasos).map((p) => p.id);
    await tx.procedimiento.updateMany({
      where: { diagramId: diagrama.id, pasoId: { in: idsPasoDestino }, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
    await tx.procedimiento.updateMany({
      where: { diagramId: diagrama.id, pasoId: { notIn: idsPasoDestino }, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    await mutarDiagramaVersionado(tx, diagrama, "restaurar", undefined, {
      cliente: version.cliente,
      proceso: version.proceso,
      actores: version.actores as Prisma.InputJsonValue,
      pasos: pasosDestino as unknown as Prisma.InputJsonValue,
      huecosReconocidos: version.huecosReconocidos as Prisma.InputJsonValue,
    });
  });

  revalidatePath(`/diagramas/${diagramId}`);
  const destino =
    avisos.length > 0
      ? `/diagramas/${diagramId}?avisosRestaurar=${encodeURIComponent(JSON.stringify(avisos))}`
      : `/diagramas/${diagramId}`;
  redirect(destino);
}

// ─────────────────────────────────────────────────────────────
// Procedimientos — Nivel 4 de F02
// docs/DISENO-NIVELES-1-4-F02.md, Parte B
// ─────────────────────────────────────────────────────────────

export type EstadoGeneracionProcedimiento = { error?: string };

/** Genera (o regenera) el procedimiento de un paso: el usuario ya escribió
 * en sus palabras cómo se hace (promptUsuario), y esta acción llama al LLM
 * para ESTRUCTURARLO — nunca para inventar contenido nuevo (§6.2 del
 * diseño). Upsert sobre la fila única (diagramId, pasoId): regenerar
 * siempre vuelve a "borrador", aunque ya estuviera confirmado — un
 * contenido nuevo requiere revisión de nuevo. */
export async function generarProcedimientoAction(
  _prevState: EstadoGeneracionProcedimiento,
  formData: FormData,
): Promise<EstadoGeneracionProcedimiento> {
  const user = await requireAppAccess();
  const diagramId = String(formData.get("diagramId") ?? "");
  const pasoId = String(formData.get("pasoId") ?? "");
  const promptUsuario = String(formData.get("promptUsuario") ?? "").trim();

  const diagrama = await diagramaDelUsuario(diagramId, user.id);
  if (!diagrama) return { error: "Diagrama no encontrado." };
  if (!promptUsuario) return { error: "Describe cómo se hace este paso antes de generar." };

  const pasos = parsePasos(diagrama.pasos);
  const idx = pasos.findIndex((p) => p.id === pasoId);
  const paso = pasos[idx];
  if (!paso) return { error: "Paso no encontrado." };
  if (!elegiblePasoProcedimiento(paso)) {
    return { error: "Este tipo de paso no lleva procedimiento." };
  }

  const vecinos = [pasos[idx - 1]?.texto, pasos[idx + 1]?.texto].filter(
    (t): t is string => !!t,
  );

  let contenido;
  try {
    contenido = await estructurarProcedimiento(
      { actor: paso.actor, texto: paso.texto, entradas: paso.entradas, salidas: paso.salidas, vecinos },
      promptUsuario,
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar el procedimiento." };
  }

  await prisma.procedimiento.upsert({
    where: { diagramId_pasoId: { diagramId, pasoId } },
    create: {
      diagramId,
      userId: user.id,
      pasoId,
      contenido: contenido as unknown as Prisma.InputJsonValue,
      promptFuente: promptUsuario,
      estado: "borrador",
    },
    update: {
      contenido: contenido as unknown as Prisma.InputJsonValue,
      promptFuente: promptUsuario,
      estado: "borrador",
      deletedAt: null,
    },
  });

  revalidatePath(`/diagramas/${diagramId}`);
  return {};
}

/** Guarda ediciones manuales del contenido estructurado (el usuario ajustó
 * el borrador que propuso el LLM, o lo escribió desde cero). Editar no
 * confirma: vuelve a "borrador" si estaba confirmado, porque el contenido
 * cambió y hay que revisarlo de nuevo. */
export async function guardarProcedimientoManualAction(formData: FormData) {
  const user = await requireAppAccess();
  const diagramId = String(formData.get("diagramId") ?? "");
  const pasoId = String(formData.get("pasoId") ?? "");
  const contenidoJson = String(formData.get("contenidoJson") ?? "");

  const diagrama = await diagramaDelUsuario(diagramId, user.id);
  if (!diagrama) return;

  let contenidoBruto: unknown;
  try {
    contenidoBruto = JSON.parse(contenidoJson);
  } catch {
    return;
  }
  const parsed = procedimientoSchema.safeParse(contenidoBruto);
  if (!parsed.success) return;

  const existente = await prisma.procedimiento.findUnique({
    where: { diagramId_pasoId: { diagramId, pasoId } },
  });

  await prisma.procedimiento.upsert({
    where: { diagramId_pasoId: { diagramId, pasoId } },
    create: {
      diagramId,
      userId: user.id,
      pasoId,
      contenido: parsed.data as unknown as Prisma.InputJsonValue,
      promptFuente: existente?.promptFuente ?? "",
      estado: "borrador",
    },
    update: {
      contenido: parsed.data as unknown as Prisma.InputJsonValue,
      estado: "borrador",
      deletedAt: null,
    },
  });

  revalidatePath(`/diagramas/${diagramId}`);
}

/** Marca el procedimiento como confirmado: el usuario revisó el contenido
 * (propuesto por IA o editado a mano) y lo da por bueno. Puramente un
 * cambio de estado — no toca el contenido. */
export async function confirmarProcedimientoAction(formData: FormData) {
  const user = await requireAppAccess();
  const diagramId = String(formData.get("diagramId") ?? "");
  const pasoId = String(formData.get("pasoId") ?? "");

  const diagrama = await diagramaDelUsuario(diagramId, user.id);
  if (!diagrama) return;

  await prisma.procedimiento.updateMany({
    where: { diagramId, pasoId, deletedAt: null },
    data: { estado: "confirmado" },
  });

  revalidatePath(`/diagramas/${diagramId}`);
}
