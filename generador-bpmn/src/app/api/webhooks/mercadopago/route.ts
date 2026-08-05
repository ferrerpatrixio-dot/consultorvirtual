import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerPreapproval, obtenerPagoAutorizado } from "@/lib/mercadopago";

// Receptor de notificaciones de Mercado Pago para los tres tópicos de la
// Fase 5 (ver docs/SPIKE-MERCADO-PAGO-BPMN-DESDE-PROMPT.md sección 1.2 y
// docs/referencia/MERCADO-PAGO.md sección 5): subscription_preapproval,
// subscription_authorized_payment y payments. El webhook solo avisa "el
// recurso <id> cambió" — nunca trae el estado completo, hay que ir a
// buscarlo con GET.
//
// Correlación con nuestro usuario: NO confiamos en `external_reference` del
// payload del webhook (no viene ahí, hay que consultarlo) — resolvemos
// siempre a un preapproval_id y buscamos al usuario por
// mercadopagoPreapprovalId (columna única seteada al crear la suscripción
// en src/app/suscripcion/actions.ts).
//
// ⚠️ Sin verificación de firma todavía (MERCADOPAGO_WEBHOOK_SECRET no está
// configurado — ver .env.local). Mientras tanto este endpoint confía en
// cualquier POST que le llegue; agregar verificación de `x-signature` antes
// de ir a producción (Mercado Pago documenta el esquema HMAC en el panel de
// la Aplicación → Webhooks).

type WebhookBody = {
  type?: string;
  topic?: string;
  action?: string;
  data?: { id?: string | number };
};

async function actualizarEstadoPorPreapproval(preapprovalId: string) {
  const preapproval = await obtenerPreapproval(preapprovalId);
  await prisma.user.updateMany({
    where: { mercadopagoPreapprovalId: preapprovalId },
    data: { subscriptionStatus: preapproval.status },
  });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => null)) as WebhookBody | null;

  // Mercado Pago envía el tópico/id tanto por query string (IPN clásico:
  // ?topic=...&id=...) como en el body JSON (webhooks nuevos: {type, data.id}).
  const topic = url.searchParams.get("topic") ?? url.searchParams.get("type") ?? body?.type ?? body?.topic;
  const resourceId = url.searchParams.get("id") ?? String(body?.data?.id ?? "");

  if (!topic || !resourceId) {
    // Nada accionable — confirmamos recepción igual para que MP no reintente.
    return NextResponse.json({ ok: true });
  }

  try {
    if (topic === "subscription_preapproval" || topic === "preapproval") {
      await actualizarEstadoPorPreapproval(resourceId);
    } else if (topic === "subscription_authorized_payment") {
      const pagoAutorizado = await obtenerPagoAutorizado(resourceId);
      if (pagoAutorizado.preapproval_id) {
        await actualizarEstadoPorPreapproval(pagoAutorizado.preapproval_id);
      }
    }
    // topic === "payment" / "payments": no hay un campo confirmado que
    // vincule un pago individual de vuelta a su preapproval_id (ver nota en
    // src/lib/mercadopago.ts). Se reciben pero no actualizan estado —
    // subscription_preapproval y subscription_authorized_payment ya cubren
    // los cambios de estado que importan para el gating de acceso.
  } catch (err) {
    // No relanzamos: devolver error acá hace que Mercado Pago reintente con
    // backoff, y un tópico que no podemos resolver (ej. "payments" sin
    // preapproval_id) reintentaría indefinidamente sin nunca poder procesarse.
    console.error("[webhook mercadopago] error procesando notificación", { topic, resourceId }, err);
  }

  return NextResponse.json({ ok: true });
}

// Mercado Pago puede validar el endpoint con un GET al configurarlo en el panel.
export async function GET() {
  return NextResponse.json({ ok: true });
}
