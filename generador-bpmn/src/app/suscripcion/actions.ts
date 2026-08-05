"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { crearPreapproval } from "@/lib/mercadopago";

export type SuscripcionState = { error?: string };

/** Recibe el card_token_id generado client-side por CardForm (nunca vemos
 * los datos de la tarjeta) y da de alta la suscripción del usuario logueado
 * contra el plan único de la app. Ver docs/SPIKE-MERCADO-PAGO-BPMN-DESDE-PROMPT.md. */
export async function crearSuscripcionAction(cardTokenId: string): Promise<SuscripcionState> {
  const user = await requireUser();

  if (!cardTokenId) {
    return { error: "No se recibió el token de la tarjeta. Intenta de nuevo." };
  }
  if (!user.email) {
    return { error: "Tu cuenta no tiene un email asociado; no se puede crear la suscripción." };
  }

  const planId = process.env.MERCADOPAGO_PREAPPROVAL_PLAN_ID;
  const backUrl = process.env.MERCADOPAGO_BACK_URL;
  if (!planId || !backUrl) {
    return {
      error:
        "La suscripción no está disponible: falta configurar Mercado Pago en el servidor (MERCADOPAGO_PREAPPROVAL_PLAN_ID / MERCADOPAGO_BACK_URL).",
    };
  }

  let preapproval;
  try {
    preapproval = await crearPreapproval({
      preapprovalPlanId: planId,
      cardTokenId,
      payerEmail: user.email,
      externalReference: user.id,
      backUrl,
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "No se pudo crear la suscripción. Intenta de nuevo.",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: preapproval.status,
      mercadopagoPreapprovalId: preapproval.id,
    },
  });

  if (preapproval.status === "authorized") {
    redirect("/dashboard");
  }

  return {
    error: `La suscripción quedó en estado "${preapproval.status}", no "authorized". Revisa los datos de la tarjeta o intenta de nuevo.`,
  };
}
