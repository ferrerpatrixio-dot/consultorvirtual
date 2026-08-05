import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { evaluarAcceso } from "@/lib/trial";

/** Devuelve el usuario autenticado o redirige al home si no hay sesión. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }
  return session.user;
}

/** Igual que requireUser, pero además exige que el usuario tenga algo que
 * hacer sin pagar: suscripción activa, o Free Trial de 3 días vigente (ver
 * src/lib/trial.ts). Usado para proteger /dashboard y /diagramas/* (ver
 * src/app/(app)/layout.tsx) y las Server Actions que no crean diagramas
 * nuevos (ver src/app/(app)/actions.ts). Un usuario en trial vigente entra
 * aunque ya haya agotado su cupo de creación — puede seguir viendo/editando
 * lo que ya tiene; ese límite se controla aparte con requireCreationAccess.
 * Solo se redirige a /suscripcion cuando no queda ni suscripción ni trial. */
export async function requireAppAccess() {
  const user = await requireUser();
  const acceso = await evaluarAcceso(user.id);
  if (!acceso.puedeUsarApp) {
    redirect("/suscripcion?motivo=trial-vencido");
  }
  return user;
}

/** Igual que requireAppAccess, pero además exige cupo para crear un
 * diagrama nuevo: suscripción activa, o trial vigente con el cupo de 1
 * diagrama todavía disponible. Usado en las Server Actions y páginas que
 * crean diagramas (crearDiagramaAction, generarDesdePromptAction,
 * /diagramas/nuevo, /diagramas/nuevo-ia) para que el bloqueo del segundo
 * diagrama funcione a nivel de servidor, no solo ocultando el botón en la
 * UI. */
export async function requireCreationAccess() {
  const user = await requireUser();
  const acceso = await evaluarAcceso(user.id);
  if (!acceso.puedeUsarApp) {
    redirect("/suscripcion?motivo=trial-vencido");
  }
  if (!acceso.puedeCrearDiagrama) {
    redirect("/suscripcion?motivo=cupo-usado");
  }
  return user;
}
