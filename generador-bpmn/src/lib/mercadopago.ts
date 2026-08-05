// Fase 5 — Mercado Pago, "Suscripciones con plan asociado".
// Wrapper delgado sobre la REST API (fetch nativo, sin instalar el SDK
// `mercadopago` de npm — no hace falta para las 4 llamadas que usa esta
// app, y evita una dependencia más para mantener). Decisiones ya cerradas,
// ver docs/SPIKE-MERCADO-PAGO-BPMN-DESDE-PROMPT.md y
// docs/referencia/MERCADO-PAGO.md — no reabrir acá:
// - Variante "con plan asociado": POST /preapproval_plan una vez,
//   POST /preapproval por cliente con card_token_id.
// - CLP siempre entero (currency_id "CLP", sin decimales).
// - identification.type debe ser "RUT" para Chile (lo genera CardForm en el
//   navegador a partir del site de la Public Key; no se arma acá).

const MP_API_BASE = "https://api.mercadopago.com";

/** Estados posibles de un preapproval, tal como los devuelve la API de
 * Mercado Pago. null = el usuario nunca intentó suscribirse. */
export type PreapprovalStatus = "pending" | "authorized" | "paused" | "cancelled";

function accessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "Mercado Pago no está configurado: falta MERCADOPAGO_ACCESS_TOKEN en el servidor.",
    );
  }
  return token;
}

type MpErrorBody = { message?: string; error?: string; cause?: { description?: string }[] };

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${MP_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken()}`,
      ...(init?.headers ?? {}),
    },
  });

  const body = (await resp.json().catch(() => null)) as MpErrorBody | T | null;

  if (!resp.ok) {
    const err = body as MpErrorBody | null;
    const detalle =
      err?.cause?.[0]?.description ?? err?.message ?? err?.error ?? `Mercado Pago respondió ${resp.status}`;
    throw new Error(`Mercado Pago: ${detalle}`);
  }

  return body as T;
}

// ─────────────────────────────────────────────────────────────
// Plan (se crea UNA sola vez — ver scripts/bootstrap-mercadopago-plan.mjs)
// ─────────────────────────────────────────────────────────────

export type PreapprovalPlan = { id: string; status: string };

export async function crearPreapprovalPlan(opts: {
  reason: string;
  transactionAmount: number;
  backUrl: string;
}): Promise<PreapprovalPlan> {
  return mpFetch<PreapprovalPlan>("/preapproval_plan", {
    method: "POST",
    body: JSON.stringify({
      reason: opts.reason,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: opts.transactionAmount,
        currency_id: "CLP",
      },
      back_url: opts.backUrl,
    }),
  });
}

// ─────────────────────────────────────────────────────────────
// Suscripción por cliente
// ─────────────────────────────────────────────────────────────

export type Preapproval = {
  id: string;
  status: PreapprovalStatus;
  external_reference: string | null;
};

/** Crea la suscripción de un usuario contra el plan único de la app.
 * `cardTokenId` viene del CardForm client-side (nunca vemos la tarjeta). */
export async function crearPreapproval(opts: {
  preapprovalPlanId: string;
  cardTokenId: string;
  payerEmail: string;
  externalReference: string;
  backUrl: string;
}): Promise<Preapproval> {
  return mpFetch<Preapproval>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      preapproval_plan_id: opts.preapprovalPlanId,
      card_token_id: opts.cardTokenId,
      payer_email: opts.payerEmail,
      external_reference: opts.externalReference,
      back_url: opts.backUrl,
      status: "authorized",
    }),
  });
}

/** Consulta el estado real de una suscripción. El webhook solo avisa "algo
 * cambió" (data.id) — hay que llamar esto para saber el estado. */
export async function obtenerPreapproval(id: string): Promise<Preapproval> {
  return mpFetch<Preapproval>(`/preapproval/${id}`);
}

// ─────────────────────────────────────────────────────────────
// Pagos (tópicos de webhook subscription_authorized_payment y payments)
// ─────────────────────────────────────────────────────────────

export type PagoAutorizado = { id: number; preapproval_id: string; status: string };

/** GET /authorized_payments/{id} — resuelve un evento del tópico
 * "subscription_authorized_payment" a su preapproval_id, para poder
 * actualizar el estado del usuario correspondiente.
 *
 * ⚠️ Endpoint NO confirmado end-to-end contra un payload real de webhook en
 * este proyecto (el spike de docs/SPIKE-MERCADO-PAGO-BPMN-DESDE-PROMPT.md no
 * pudo completar /preapproval en sandbox, así que tampoco se generó un
 * cobro real que disparara este tópico). Validar contra un evento real antes
 * de confiar en esto en producción. */
export async function obtenerPagoAutorizado(id: string): Promise<PagoAutorizado> {
  return mpFetch<PagoAutorizado>(`/authorized_payments/${id}`);
}

export type Pago = { id: number; status: string; status_detail: string };

/** GET /v1/payments/{id} — detalle del pago individual (tópico "payments"). */
export async function obtenerPago(id: string): Promise<Pago> {
  return mpFetch<Pago>(`/v1/payments/${id}`);
}
