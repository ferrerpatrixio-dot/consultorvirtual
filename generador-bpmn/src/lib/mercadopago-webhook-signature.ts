// Verificación de firma HMAC-SHA256 de webhooks de Mercado Pago.
// Algoritmo confirmado contra la documentación oficial de Mercado Pago
// Developers ("Webhooks" / "Notificaciones" — sección x-signature, válida
// para preapproval/suscripciones y pagos): el header `x-signature` trae
// `ts=<timestamp>,v1=<hash>`; el hash es HMAC-SHA256 (hex) de un "manifest"
// con el formato exacto:
//
//   id:{data.id};request-id:{x-request-id};ts:{ts};
//
// donde `data.id` es el id del recurso (viene en la URL, ej. ?data.id=123 o
// ?id=123 según el tópico) normalizado a minúsculas, `x-request-id` es el
// header del mismo nombre, y `ts` es el timestamp tal cual viene en
// x-signature. Ver docs/referencia/MERCADO-PAGO.md.

import { createHmac, timingSafeEqual } from "crypto";

type ParsedXSignature = { ts: string; v1: string };

function parseXSignature(header: string): ParsedXSignature | null {
  const parts = Object.fromEntries(
    header
      .split(",")
      .map((p) => p.trim().split("=").map((s) => s.trim()))
      .filter((pair): pair is [string, string] => pair.length === 2),
  );
  if (!parts.ts || !parts.v1) return null;
  return { ts: parts.ts, v1: parts.v1 };
}

/** Verifica la firma de una notificación webhook de Mercado Pago.
 * @param dataId id del recurso notificado (query param `data.id` o `id`)
 * @param xRequestId header `x-request-id`
 * @param xSignature header `x-signature` completo (`ts=...,v1=...`)
 * @param secret `MERCADOPAGO_WEBHOOK_SECRET`
 */
export function verificarFirmaWebhook(opts: {
  dataId: string;
  xRequestId: string | null;
  xSignature: string | null;
  secret: string;
}): boolean {
  const { dataId, xRequestId, xSignature, secret } = opts;
  if (!xSignature || !xRequestId || !dataId) return false;

  const parsed = parseXSignature(xSignature);
  if (!parsed) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${parsed.ts};`;
  const hashEsperado = createHmac("sha256", secret).update(manifest).digest("hex");

  const bufEsperado = Buffer.from(hashEsperado, "hex");
  const bufRecibido = Buffer.from(parsed.v1, "hex");
  if (bufEsperado.length !== bufRecibido.length) return false;

  return timingSafeEqual(bufEsperado, bufRecibido);
}
