import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Devuelve el usuario autenticado o redirige al home si no hay sesión. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }
  return session.user;
}

/** Igual que requireUser, pero además exige suscripción activa
 * (subscriptionStatus === "authorized"). Usado para proteger /dashboard y
 * /diagramas/* (ver src/app/(app)/layout.tsx) — Fase 5, modelo de acceso
 * cerrado: login + plan de pago activo (ver
 * docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md sección 3). Un usuario
 * logueado pero sin suscripción activa va a /suscripcion, no al home. */
export async function requireActiveSubscription() {
  const user = await requireUser();
  const registro = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscriptionStatus: true },
  });
  if (registro?.subscriptionStatus !== "authorized") {
    redirect("/suscripcion");
  }
  return user;
}
