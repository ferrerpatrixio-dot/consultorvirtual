// Fase 5 — Mercado Pago. Crea el preapproval_plan de la app UNA sola vez
// (no hay tiers, un solo plan para todos los usuarios). No usa ninguna
// dependencia nueva: Node 20+ trae fetch nativo y --env-file.
//
// Uso:
//   node --env-file=.env.local scripts/bootstrap-mercadopago-plan.mjs
//
// Al terminar, copia el "id" que imprime a .env.local como
// MERCADOPAGO_PREAPPROVAL_PLAN_ID. Si esa variable ya está seteada, el
// script se niega a correr de nuevo (evita crear planes duplicados por
// error — Mercado Pago no tiene problema en tener varios, pero la app solo
// usa el que esté en el env).

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const backUrl = process.env.MERCADOPAGO_BACK_URL ?? `${process.env.AUTH_URL ?? "http://localhost:3000"}/suscripcion`;
const precioClp = 9990; // CLP $9.990/mes, ya fijado (ver PROPUESTA-ARQUITECTO, actualización 2026-08-04)

if (process.env.MERCADOPAGO_PREAPPROVAL_PLAN_ID) {
  console.error(
    `MERCADOPAGO_PREAPPROVAL_PLAN_ID ya está seteado (${process.env.MERCADOPAGO_PREAPPROVAL_PLAN_ID}). ` +
      "El plan ya existe — no se crea uno nuevo. Si de verdad necesitas otro plan, quita la variable primero.",
  );
  process.exit(1);
}

if (!accessToken) {
  console.error("Falta MERCADOPAGO_ACCESS_TOKEN. Corré con: node --env-file=.env.local scripts/bootstrap-mercadopago-plan.mjs");
  process.exit(1);
}

const resp = await fetch("https://api.mercadopago.com/preapproval_plan", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    reason: "Generador BPMN - Plan Mensual",
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: precioClp,
      currency_id: "CLP",
    },
    back_url: backUrl,
  }),
});

const body = await resp.json();

if (!resp.ok) {
  console.error(`Mercado Pago respondió ${resp.status}:`, JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log(`Plan creado. status=${body.status}`);
console.log("");
console.log(`Agrega esto a .env.local:`);
console.log(`MERCADOPAGO_PREAPPROVAL_PLAN_ID="${body.id}"`);
