import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerPreapproval, obtenerPagoAutorizado } from "@/lib/mercadopago";
import { verificarFirmaWebhook } from "@/lib/mercadopago-webhook-signature";

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
// Verificación de firma (`x-signature`/`x-request-id`, HMAC-SHA256 — ver
// src/lib/mercadopago-webhook-signature.ts): solo se aplica si
// MERCADOPAGO_WEBHOOK_SECRET está configurado. Mientras no lo esté (hoy en
// .env.local, hallazgo #2 de docs/AUDITORIA-SECURITY-FASE5-MERCADOPAGO.md)
// se procesa sin verificar pero se deja un console.warn visible en cada
// request para que no pase desapercibido en logs de producción.

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

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    // Sin secreto configurado no hay forma de verificar — se procesa igual
    // (comportamiento actual) pero queda visible en logs de producción.
    console.warn(
      "[webhook mercadopago] MERCADOPAGO_WEBHOOK_SECRET no configurado — procesando notificación SIN verificar firma",
      { topic, resourceId },
    );
  } else {
    const firmaValida = verificarFirmaWebhook({
      dataId: resourceId,
      xRequestId: req.headers.get("x-request-id"),
      xSignature: req.headers.get("x-signature"),
      secret,
    });
    if (!firmaValida) {
      // 401 (no 200) para que Mercado Pago sepa que la notificación fue
      // rechazada y reintente — a diferencia del catch de abajo, donde SÍ
      // devolvemos 200 para tópicos que nunca vamos a poder procesar. Un
      // secreto mal configurado hace que esto rechace TODO tráfico legítimo
      // hasta que se corrija; no es un loop infinito (MP reintenta con
      // backoff creciente y desiste tras un tiempo, comportamiento estándar
      // documentado por MP), pero si se ve esto sostenido en logs hay que
      // revisar el valor de MERCADOPAGO_WEBHOOK_SECRET antes que nada.
      console.error("[webhook mercadopago] firma inválida — notificación rechazada", { topic, resourceId });
      return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
    }
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
