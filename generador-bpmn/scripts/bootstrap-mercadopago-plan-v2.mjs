// Crea un SEGUNDO preapproval_plan en Mercado Pago para el ajuste de precio
// de CLP $9.990 a CLP $19.900/mes (aprobado por PM/Patricio, 2026-08).
//
// Por qué un plan nuevo y no editar el viejo: Mercado Pago no permite
// cambiar el monto de un preapproval_plan que ya tiene suscriptores
// (requeriría re-consentimiento de cada uno). Se crea un plan aparte con
// nombre distinguible ("v2" + fecha) para identificarlo en el dashboard de
// Mercado Pago sin tocar el plan viejo.
//
// A diferencia del script original (bootstrap-mercadopago-plan.mjs), este
// SIEMPRE requiere --confirm para ejecutar el POST real, sin importar el
// estado de MERCADOPAGO_PREAPPROVAL_PLAN_ID (esa env var ya está seteada
// con el plan viejo, que sigue vigente hasta que se migre).
//
// Uso:
//   Ver qué se enviaría, sin llamar a la API:
//     node --env-file=.env.local scripts/bootstrap-mercadopago-plan-v2.mjs --dry-run
//
//   Crear el plan de verdad (cobra/crea objeto real en Mercado Pago):
//     node --env-file=.env.local scripts/bootstrap-mercadopago-plan-v2.mjs --confirm
//
// Al terminar (con --confirm), copiá el "id" que imprime a .env.local /
// variables de entorno de producción como MERCADOPAGO_PREAPPROVAL_PLAN_ID,
// reemplazando el valor del plan viejo. El código de la app (ver
// src/app/suscripcion/page.tsx y src/app/suscripcion/actions.ts) solo lee
// esa env var, no tiene ningún plan ID hardcodeado — el cambio de plan es
// puramente de configuración, no requiere deploy de código.

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const backUrl = process.env.MERCADOPAGO_BACK_URL ?? `${process.env.AUTH_URL ?? "http://localhost:3000"}/suscripcion`;
const precioClp = 19900; // CLP $19.900/mes — nuevo precio único (PM, aprobado por Patricio, 2026-08)

const dryRun = process.argv.includes("--dry-run");
const confirm = process.argv.includes("--confirm");

if (!dryRun && !confirm) {
  console.error(
    "Falta --dry-run o --confirm. Este script crea un objeto de facturación real en Mercado Pago " +
      "cuando corre con --confirm. Usá --dry-run primero para revisar el payload.",
  );
  process.exit(1);
}

if (!accessToken) {
  console.error("Falta MERCADOPAGO_ACCESS_TOKEN en el entorno.");
  process.exit(1);
}

const nombrePlan = `Generador BPMN - Plan Mensual v2 (${new Date().toISOString().slice(0, 10)})`;

const payload = {
  reason: nombrePlan,
  auto_recurring: {
    frequency: 1,
    frequency_type: "months",
    transaction_amount: precioClp,
    currency_id: "CLP",
  },
  back_url: backUrl,
};

if (dryRun) {
  console.log("DRY RUN — no se llamó a la API de Mercado Pago. Payload que se enviaría:");
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const resp = await fetch("https://api.mercadopago.com/preapproval_plan", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify(payload),
});

const body = await resp.json();

if (!resp.ok) {
  console.error(`Mercado Pago respondió ${resp.status}:`, JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log(`Plan v2 creado. status=${body.status}`);
console.log("");
console.log("Actualizá esta variable de entorno (reemplaza el valor del plan viejo):");
console.log(`MERCADOPAGO_PREAPPROVAL_PLAN_ID="${body.id}"`);
