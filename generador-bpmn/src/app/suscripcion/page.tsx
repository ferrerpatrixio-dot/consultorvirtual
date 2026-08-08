import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/auth-actions";
import { SuscripcionForm } from "./SuscripcionForm";

// Página de alta de suscripción. Fuera del grupo (app) a propósito: requiere
// login (requireUser) pero NO pasa por requireActiveSubscription — si lo
// hiciera, un usuario sin suscripción activa nunca podría llegar aquí para
// pagar. Ver src/lib/session.ts y src/app/(app)/layout.tsx.
export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string }>;
}) {
  const user = await requireUser();
  const { motivo } = await searchParams;
  const registro = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscriptionStatus: true },
  });

  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
  const planId = process.env.MERCADOPAGO_PREAPPROVAL_PLAN_ID;
  const configurado = Boolean(publicKey && planId);

  // Mensaje de bloqueo de trial, según por qué llegó acá (ver
  // requireCreationAccess / requireAppAccess en src/lib/session.ts) — el
  // momento de mayor intención de compra es justo cuando el usuario intenta
  // crear un segundo diagrama, así que el mensaje va con el precio visible,
  // no como un error genérico (ver
  // docs/VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md sección 8.3).
  const mensajeTrial =
    motivo === "cupo-usado"
      ? "En la versión de evaluación se detalla un proceso a la vez. Borra el que ya tienes desde el dashboard para detallar otro gratis, o activa tu plan para tener varios en simultáneo por CLP $19.900/mes."
      : motivo === "trial-vencido"
        ? "Tu prueba gratuita de 3 días terminó. Activa tu plan por CLP $19.900/mes para seguir usando el generador de diagramas."
        : null;

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-bold text-ink">Activa tu suscripción</h1>
      {mensajeTrial && (
        <p className="mt-3 rounded-lg border border-primary bg-bg p-3 text-sm font-medium text-ink">
          {mensajeTrial}
        </p>
      )}
      {motivo === "cupo-usado" && (
        <a
          href="/dashboard"
          className="mt-2 inline-block text-sm font-medium text-primary-ink underline"
        >
          Ir al dashboard para borrar mi proceso actual
        </a>
      )}
      <p className="mt-1 text-sm text-ink-2">
        Plan único: CLP $19.900/mes. Necesitas una suscripción activa para
        usar el generador de diagramas.
      </p>

      {registro?.subscriptionStatus && registro.subscriptionStatus !== "authorized" && (
        <p className="mt-4 rounded-lg border border-line bg-surface p-3 text-sm text-ink-2">
          Estado actual: <strong className="text-ink">{registro.subscriptionStatus}</strong>.
          Si ya pagaste y sigue así, espera un momento y recarga la página —
          el estado se actualiza cuando Mercado Pago confirma el cobro.
        </p>
      )}

      {configurado ? (
        <SuscripcionForm publicKey={publicKey!} />
      ) : (
        <p className="mt-6 rounded-lg border border-danger bg-surface p-4 text-sm text-danger">
          La suscripción no está disponible todavía: falta configurar Mercado
          Pago en el servidor (MERCADOPAGO_PUBLIC_KEY / MERCADOPAGO_PREAPPROVAL_PLAN_ID).
        </p>
      )}

      <form action={logout} className="mt-8">
        <button type="submit" className="cursor-pointer text-sm text-ink-2 underline hover:text-ink">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
