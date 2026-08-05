# Mercado Pago — Guía de referencia técnica

**Propósito:** consolidar en un solo lugar lo que ya investigamos sobre integrar Mercado Pago,
para que el próximo proyecto que necesite cobrar (suscripción o pago único) no tenga que
re-investigar desde cero. Escrito a partir de documentación oficial de Mercado Pago Developers
(pegada por Patricio) más investigación propia (PM/DEV/ARQUITECTO IT) durante el desarrollo de
`generador-bpmn` (2026-08-04).

**Cómo usar este documento:** es referencia técnica general de la plataforma, no un registro de
decisiones de un proyecto específico. Las decisiones tomadas para `generador-bpmn` (qué opción
se eligió, sizing, etc.) viven en `docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md` y
`docs/SPIKE-MERCADO-PAGO-BPMN-DESDE-PROMPT.md` — este doc solo explica cómo funciona Mercado
Pago en general, para que ARQUITECTO IT no tenga que releer documentación externa cada vez.

---

## 1. Dos formas de cobrar

| | Pago único | Cobro recurrente / suscripción |
|---|---|---|
| API | `POST /v1/payments` (Checkout API) | `POST /preapproval` (Subscriptions API) |
| Caso de uso | Venta puntual de un producto/servicio | SaaS, membresías, cualquier cobro periódico automático |

Este documento cubre ambas, porque la tokenización de tarjeta (sección 3) es compartida entre
las dos.

---

## 2. Cobro recurrente: dos caminos, según cuánta integración necesitás

### Opción A — Planes de suscripción (sin integración)

Para cuando alcanza con crear un plan y compartir un link (no hace falta que el flujo viva
dentro de tu app).

1. Creás el plan (nombre, monto, frecuencia) desde el panel de Mercado Pago.
2. Compartís el link (WhatsApp, redes, botón en la web).
3. El cliente paga/autoriza una vez y los cobros siguientes son automáticos.

Guías oficiales:
- [Suscripciones (visión general)](https://www.mercadopago.cl/herramientas-para-vender/suscripciones)
- [Planes de suscripción (overview)](https://www.mercadopago.cl/developers/es/docs/subscription-plans/overview)
- [Crear plan de suscripción](https://www.mercadopago.cl/developers/es/docs/subscription-plans/create-subscription-plan)

### Opción B — Suscripciones integradas por API (dentro de tu app)

Para cuando necesitás que el alta/baja, la lógica por usuario, etc. vivan en tu propio software.
Dos variantes:

- **Con plan asociado:** cuando el mismo plan se reutiliza para muchos clientes (ej. "Mensual"
  y "Anual" de un gimnasio, o un plan único de SaaS). Flujo en dos pasos:
  1. Crear el plan una sola vez: `POST /preapproval_plan` (`reason`, `auto_recurring: {frequency,
     frequency_type, transaction_amount, currency_id, billing_day, billing_day_proportional,
     free_trial, ...}`). La respuesta trae `id`, que en este contexto se llama
     `preapproval_plan_id` — **obligatorio** para el paso 2.
  2. Crear la suscripción por cliente: `POST /preapproval` (`preapproval_plan_id`, `reason`,
     `external_reference`, `payer_email`, `card_token_id`, `auto_recurring: {...}`,
     `status: "authorized"`). **Siempre se crea con `card_token_id` y `status: "authorized"`** —
     no hay checkout hosteado para esta variante, el token se genera client-side (ver sección 3).
- **Sin plan asociado:** cuando cada cliente puede tener condiciones distintas (monto final
  variable). Mismo endpoint `/preapproval`, pero sin `preapproval_plan_id` — se define
  `auto_recurring` completo directamente en la suscripción.

Ejemplo (`POST /preapproval_plan`):

```bash
curl -X POST \
  'https://api.mercadopago.com/preapproval_plan' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "reason": "Yoga classes",
  "auto_recurring": {
    "frequency": 1,
    "frequency_type": "months",
    "repetitions": 12,
    "billing_day": 10,
    "billing_day_proportional": true,
    "free_trial": { "frequency": 1, "frequency_type": "months" },
    "transaction_amount": 10,
    "currency_id": "ARS"
  },
  "payment_methods_allowed": { "payment_types": [{}], "payment_methods": [{}] },
  "back_url": "https://www.yoursite.com"
}'
```

Ejemplo (`POST /preapproval`, con plan asociado):

```bash
curl -X POST \
  'https://api.mercadopago.com/preapproval' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "preapproval_plan_id": "2c938084726fca480172750000000000",
  "reason": "Yoga classes",
  "external_reference": "YG-1234",
  "payer_email": "test_payer@example.com",
  "card_token_id": "e3ed6f098462036dd2cbabe314b9de2a",
  "auto_recurring": {
    "frequency": 1, "frequency_type": "months",
    "start_date": "2020-06-02T13:07:14.260Z",
    "end_date": "2022-07-20T15:59:52.581Z",
    "transaction_amount": 10, "currency_id": "ARS"
  },
  "back_url": "https://www.mercadopago.com.ar",
  "status": "authorized"
}'
```

Guía de conciliación de cobros: [Gestión de pagos recibidos](https://www.mercadopago.cl/developers/es/docs/subscriptions/additional-content/payment-management)

---

## 3. Tokenización de tarjeta (client-side) — 3 formas, mismo backend PCI

Cualquier flujo que necesite `card_token_id`/`token` (suscripción o pago único) requiere
capturar los datos de tarjeta en el navegador del cliente, nunca en tu servidor. Mercado Pago
ofrece **cuatro** niveles de integración para esto (tabla oficial):

| Tipo | Complejidad frontend | UI | Certifica PCI SAQ A |
|---|---|---|---|
| **Checkout Bricks** | Fácil | Componentes con UI predefinida, personalizable | Sí |
| **CardForm** | Medio | Formulario sin estilo, control total de apariencia | Sí |
| **Core Methods Web** | Alto | Formulario y estilos 100% propios | Sí |
| **Core Methods Mobile** | Alto | Igual que Web, para apps móviles | Sí |

Las cuatro logran PCI SAQ A por el mismo motivo: los datos de tarjeta (número, CVV,
vencimiento) viajan por iframe directo a los servidores de Mercado Pago — nunca son accesibles
a tu backend ni a terceros.

**⚠️ Gotcha confirmado (2026-08-04):** las integraciones con **Checkout Bricks NO soportan
"cuentas de prueba"** (sección 5) — tienen su propio flujo separado, [Hacer compra de prueba
con Checkout Bricks](https://www.mercadopago.cl/developers/es/docs/checkout-bricks/integration-test/test-payment-flow).
Si elegís Bricks, tu forma de probar esa pieza específica cambia respecto al resto de la
integración.

**⚠️ Evaluado 2026-08-04, sigue sin confirmación oficial:** no existe documentación ni ejemplo
end-to-end de Mercado Pago que combine explícitamente "Card Payment Brick" con `POST
/preapproval` (suscripciones). Hay evidencia indirecta favorable (el `card_token` es un recurso
genérico compartido, y la doc de suscripciones menciona el Brick como alternativa) pero **todos
los ejemplos de código de suscripciones usan CardForm, ninguno usa Bricks**. Conclusión de
ARQUITECTO IT para `generador-bpmn`: **quedarse con CardForm** — el ahorro de UI de Bricks
("Fácil" aplica a Checkout API genérico/pago único, no está confirmado para este caso puntual)
no compensa construir sobre una combinación no verificada, justo en la pieza que además pierde
compatibilidad con "cuentas de prueba" (fragmenta el testing en dos flujos de sandbox
distintos). Si Mercado Pago publica en el futuro un ejemplo oficial confirmando Bricks +
`/preapproval`, vale la pena reabrir la pregunta — hoy no hay base documental para el cambio.
Detalle completo con fuentes: `docs/SPIKE-MERCADO-PAGO-BPMN-DESDE-PROMPT.md` sección 5.

### 3.1 Requisitos previos para cualquiera de las cuatro

| Requisito | Qué es |
|---|---|
| **Aplicación** | Se crea en el panel de Mercado Pago Developers (`Tus integraciones`). Podés tener una app por cada integración/producto para mantener todo organizado. |
| **Credenciales** | Un par de credenciales de **prueba** (`TEST-...`) para desarrollo, y un par de **producción** para cobrar de verdad. Viven dentro de la Aplicación. |
| **MercadoPago.js** | La librería (`@mercadopago/sdk-js` o `<script src="https://sdk.mercadopago.com/js/v2">`) que gestiona los datos de tarjeta sin que pasen por tu servidor y genera el token. |

### 3.2 Integración con CardForm — flujo completo

**⚠️ Gotcha confirmado con dato real (2026-08-04, `POST /v1/card_tokens`, `site_id: MLC`
Chile):** el campo `identification.type` del titular **debe ser `"RUT"`**, no `"OTHE"` (aunque
la tabla de tarjetas de prueba sugiera "otro" para el número genérico de prueba). Usar `"OTHE"`
devuelve `400 "Invalid cardholder.identification.type: OTHE in site_id: MLC"`. Aplica también a
`/preapproval` y `/v1/payments` cuando el `payer.identification.type` se arma con el mismo
criterio.

```bash
npm install @mercadopago/sdk-js
```

```javascript
import { loadMercadoPago } from "@mercadopago/sdk-js";
await loadMercadoPago();
const mp = new window.MercadoPago("YOUR_PUBLIC_KEY"); // Public Key, NO el Access Token
```

HTML del formulario (los `id` son fijos, MercadoPago.js los busca por nombre):

```html
<form id="form-checkout">
  <div id="form-checkout__cardNumber" class="container"></div>
  <div id="form-checkout__expirationDate" class="container"></div>
  <div id="form-checkout__securityCode" class="container"></div>
  <input type="text" id="form-checkout__cardholderName" />
  <select id="form-checkout__issuer"></select>
  <select id="form-checkout__installments"></select>
  <select id="form-checkout__identificationType"></select>
  <input type="text" id="form-checkout__identificationNumber" />
  <input type="email" id="form-checkout__cardholderEmail" />
  <button type="submit" id="form-checkout__submit">Pagar</button>
</form>
```

Inicialización (`mp.cardForm({...})`, resumido — ver doc oficial para el objeto completo de
`callbacks`): al enviar el formulario se genera un token (`CardToken`), accesible vía
`cardForm.getCardFormData()` dentro del callback `onSubmit`, y también queda en un input oculto
`MPHiddenInputToken`. **El token es de un solo uso y caduca en 7 días.**

El backend recibe ese token (nunca los datos crudos de la tarjeta) y hace la llamada real:
- Pago único: `POST /v1/payments` con `token`, `transaction_amount`, `installments`,
  `payment_method_id`, `payer.email` (+ header `X-Idempotency-Key` obligatorio, UUID v4 o
  similar — sin el formato `"prefijo" + "_"`).
- Suscripción con plan asociado: `POST /preapproval` con `card_token_id` = ese mismo token (ver
  sección 2).

Nota de mejora de aprobación: Mercado Pago recomienda mandar la mayor cantidad de datos del
comprador posible para reducir rechazos por antifraude, y adoptar 3DS 2.0 si el volumen lo
justifica ([Cómo integrar 3DS](https://www.mercadopago.cl/developers/es/docs/checkout-api-payments/how-tos/integrate-3ds)).

Alternativa sin formulario propio: **Card Payment Brick** (dentro de Checkout Bricks) — mismo
resultado, UI predefinida. Ver [Renderizado por defecto](https://www.mercadopago.cl/developers/es/docs/checkout-bricks/card-payment-brick/default-rendering).

---

## 4. Cuentas de prueba (sandbox)

- Se crean **automáticamente** al crear una Aplicación, o manualmente desde
  `Tus integraciones → tu app → Cuentas de prueba → + Crear cuenta de prueba`.
- Hasta **15 cuentas de prueba simultáneas**. **No se pueden eliminar.**
- Se necesitan al menos dos: **Vendedor** (para configurar la app/credenciales de prueba) y
  **Comprador** (para probar el flujo de compra). Existe un tercer tipo, **Integrador**, solo
  para modelo marketplace.
- El **país de operación se fija al crear la cuenta y no se puede editar después**. Vendedor y
  Comprador deben ser del mismo país para probar un flujo local.
- Hay [tarjetas de crédito de prueba](https://www.mercadopago.cl/developers/es/docs/additional-content/your-integrations/test-cards)
  documentadas para simular pagos sin datos reales, y se le puede asignar saldo ficticio a la
  cuenta de prueba. **Tabla oficial vigente para Chile (2026-08-04):**

  | Tarjeta | Número | CVV | Vencimiento |
  |---|---|---|---|
  | Mastercard | 5416 7526 0258 2580 | 123 | 11/30 |
  | Visa | 4168 8188 4444 7115 | 123 | 11/30 |
  | American Express | 3757 781744 61804 | 1234 | 11/30 |

  Titular `APRO` simula "pago aprobado" (ver tabla de escenarios de nombre en la doc oficial
  para otros resultados: rechazo, fondos insuficientes, etc.). **Usar solo estas tarjetas —
  Mercado Pago advierte explícitamente que tarjetas reales o inventadas generan errores.**
- Login con cuenta de prueba puede pedir un código de verificación de 6 dígitos (visible en el
  panel de desarrollador). Con ese login **no** se tiene acceso a Credenciales de prueba ni a
  Calidad de integración (secciones que no aplican a una cuenta de prueba).
- **Excepción importante:** Checkout Bricks no usa este flujo — ver sección 3.

**Restricción de agente/automatización:** crear la Aplicación (paso previo a todo lo anterior)
exige loguearse con una cuenta real de Mercado Pago, o crear una cuenta nueva. Ningún agente de
Claude debe hacer esto — es un paso que el humano dueño del proyecto tiene que ejecutar él mismo
(entrar contraseñas y crear cuentas están fuera de lo que un agente puede hacer, incluso con
autorización explícita). El agente puede consumir las credenciales de prueba una vez generadas.

---

## 5. Webhooks / notificaciones

Para suscripciones (`/preapproval`), hay **más de un tópico relevante** a activar en el panel
de la Aplicación — no asumir que es solo "un webhook":

- **`subscription_preapproval`**: alta o cambio de estado de la suscripción (`pending` /
  `authorized` / `cancelled`).
- **`subscription_authorized_payment`**: eventos de cobro sobre una suscripción ya autorizada —
  esto avisa si el cobro periódico pasó o fue rechazado.
- **`payments`** (recomendado además): notificación del pago individual, consultable en detalle
  vía `GET /v1/payments/{id}` (`status`, `status_detail`, `date_approved`).

Para pago único (`/v1/payments`), el estado inicial puede ser `Pendiente`, `Rechazado` o
`Aprobado` — igual conviene configurar notificaciones para enterarte de cambios posteriores
(ej. una aprobación que llega tarde), no asumir que la respuesta síncrona es el estado final.

Guía oficial: [Additional information about notifications](https://www.mercadopago.com/developers/en/docs/your-integrations/notifications/additional-info)

---

## 6. Moneda — formato de `transaction_amount`

**CLP (peso chileno) debe enviarse como entero, sin decimales** (`9990`, no `9990.00`) — el
peso chileno no usa centavos desde 1984. Mercado Pago documenta el mismo patrón para otras
monedas latinoamericanas sin decimales (COP, HNL, NIO).

**Confirmado oficialmente (2026-08-04):** la documentación de Core Methods (SDK nativo
Android/iOS, tabla de parámetros de `POST /v1/payments`) dice explícito: *"`transaction_amount`:
Costo del producto. **Para Chile, debe ser un número entero.**"* — ya no es inferencia.

---

## 7. Cobertura y particularidades por país (LATAM)

Mercado Pago opera con cuenta y checkout propios en **8 países**: Argentina, Brasil, Chile,
Colombia, México, Perú, Uruguay y Ecuador. Investigado en detalle para Argentina, Chile, México,
Colombia y Perú (2026-08-04, ver `docs/VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md` sección
7 para el análisis completo con fuentes):

| País | Métodos que cubre Checkout Pro | Método local "esperado" que falta o es parcial |
|---|---|---|
| **Argentina** | Tarjetas, transferencia, dinero en cuenta MP, cuotas | Ninguno — es el mercado de origen de Mercado Pago |
| **Chile** | Tarjetas, transferencia bancaria, saldo en cuenta MP | **Webpay (Transbank) no está integrado** al checkout — riesgo de percepción de confianza (no técnico), mitigable con copy claro |
| **México** | Tarjetas, **SPEI** (transferencia instantánea), **OXXO Pay** (efectivo en tienda) | Ninguno grande falta para el alta, pero **OXXO es efectivo diferido — no sirve para cobro recurrente automático** |
| **Colombia** | Tarjetas, **PSE** (transferencia), **Nequi**/**Daviplata** (billeteras), Efecty/Baloto (efectivo) | Igual que México: fuerte para el alta, cobro recurrente depende de tarjeta |
| **Perú** | Tarjetas, **Yape** (billetera del BCP, integrada desde 2024), PagoEfectivo | Igual patrón: Yape fuerte para pago puntual, recurrente depende de tarjeta |

**Patrón que se repite (México, Colombia, Perú, no en Chile ni Argentina):** los métodos locales
de confianza (OXXO, PSE/Nequi, Yape) resuelven el "esto se ve seguro" del primer pago, pero **el
cobro automático mensual, en los 5 países, depende de tarjeta de crédito/débito tokenizada sin
excepción real.**

### 7.1 Requisito legal para abrir cuenta vendedor por país

**No confirmado, pendiente de validar contra documentación oficial de Mercado Pago
(onboarding de vendedor internacional) antes de asumir que es trivial:** una cuenta de Mercado
Pago está atada a un país específico (`site_id` distinto: MLC=Chile, MLM=México, MLA=Argentina,
MCO=Colombia, MPE=Perú) — no es una billetera regional única. No se confirmó si una entidad de
un país puede abrir cuenta vendedora en otro país sin constituir presencia legal local (RUT/RFC/
CUIT/NIT). Si la respuesta es "sí requiere entidad legal local", expandir a un país nuevo deja
de ser "agregar configuración" y pasa a ser decisión de LEGAL/inversión.

### 7.2 Abrir cuenta vendedor sin empresa constituida (Chile)

**Confirmado (2026-08-04, cruzando el flujo de registro de Mercado Pago con normativa SII —
no se pudo leer la página oficial de Mercado Pago directo, bloqueó el acceso con 403):**
Mercado Pago Chile permite cuenta vendedor como **"persona natural con giro"** (alternativa a
"sociedad comercial"), usando el RUT personal. El requisito de fondo es tener **"inicio de
actividades" en el SII** — emitir boleta de honorarios como persona natural ya lo exige
(segunda categoría), así que cualquiera que ya facture por honorarios lo cumple sin trámite
adicional. **Recomendado verificar en el flujo real de registro**
(`mercadopago.cl/hub/registration`) antes de comprometerlo, porque la fuente no fue la página
oficial directa.

---

## 8. Enlaces oficiales usados en esta investigación

- [Suscripciones (overview)](https://www.mercadopago.cl/herramientas-para-vender/suscripciones)
- [Planes de suscripción (overview)](https://www.mercadopago.cl/developers/es/docs/subscription-plans/overview)
- [Crear plan de suscripción](https://www.mercadopago.cl/developers/es/docs/subscription-plans/create-subscription-plan)
- [Crear preapproval_plan (referencia API)](https://www.mercadopago.cl/developers/es/reference/online-payments/subscriptions/create-preapproval-plan/post)
- [Crear preapproval (referencia API)](https://www.mercadopago.cl/developers/es/reference/online-payments/subscriptions/create-preapproval/post)
- [Gestión de pagos recibidos](https://www.mercadopago.cl/developers/es/docs/subscriptions/additional-content/payment-management)
- [Generación del card token](https://www.mercadopago.com.co/developers/es/docs/subscriptions/additional-content/cardtoken)
- [Notificaciones adicionales](https://www.mercadopago.com/developers/en/docs/your-integrations/notifications/additional-info)
- [Suscripciones con pago autorizado (sin plan asociado)](https://www.mercadopago.com.co/developers/en/docs/subscriptions/integration-configuration/subscription-no-associated-plan/authorized-payments)
- [Crear pago (Checkout API, referencia)](https://www.mercadopago.cl/developers/es/reference/online-payments/checkout-api-payments/create-payment/post)
- [Card Payment Brick — renderizado por defecto](https://www.mercadopago.cl/developers/es/docs/checkout-bricks/card-payment-brick/default-rendering)
- [Hacer compra de prueba con Checkout Bricks](https://www.mercadopago.cl/developers/es/docs/checkout-bricks/integration-test/test-payment-flow)
- [Tarjetas de prueba](https://www.mercadopago.cl/developers/es/docs/additional-content/your-integrations/test-cards)
- [Cómo integrar 3DS](https://www.mercadopago.cl/developers/es/docs/checkout-api-payments/how-tos/integrate-3ds)
- [Cómo mejorar la aprobación de pagos](https://www.mercadopago.cl/developers/es/docs/checkout-api-payments/how-tos/improve-payment-approval)
- [Ejemplo de integración completo, Node.js](https://github.com/mercadopago/card-payment-sample-node/tree/1.0.0) — el que aplica a nuestro stack (Next.js/TypeScript). También existen en [Java](https://github.com/mercadopago/card-payment-sample-java/tree/1.0.0) y [PHP](https://github.com/mercadopago/card-payment-sample-php/tree/1.0.0), no aplican acá.

---

## 9. Aprendizajes para el próximo proyecto (no repetir esta investigación)

- **No asumas checkout hosteado.** A diferencia de Stripe Checkout, "suscripción con plan
  asociado" no tiene una página de pago lista — hay que construir la captura de tarjeta
  (CardForm, Bricks o Core Methods). Dimensioná esto desde el principio, no lo descubras a
  mitad de proyecto (nos pasó en `generador-bpmn`: subió el sizing en ~2 días-persona).
- **No es un webhook, son varios.** Para suscripciones, contá con al menos
  `subscription_preapproval` + `subscription_authorized_payment` (+`payments` recomendado).
- **CLP (y otras monedas LATAM sin centavos) van sin decimales** — confirmado oficialmente
  (tabla de parámetros de Core Methods: "Para Chile, debe ser un número entero").
- **Core Methods (Android/iOS nativo) no aplica a un stack web** (Next.js, React, etc.) — es
  para apps móviles nativas. Para web, la elección real es entre Checkout Bricks, CardForm o
  Core Methods Web (ver sección 3).
- **No hace falta empresa constituida en Chile** — persona natural con boleta de honorarios ya
  cumple el requisito de fondo (inicio de actividades SII).
- **Checkout Bricks y "cuentas de prueba" no se llevan bien** — si elegís Bricks, tu plan de
  testing para esa pieza específica es distinto al resto.
- **Un agente de Claude no puede crear la Aplicación ni las cuentas de prueba** — requiere login
  humano real. Pedile esto a la persona antes de bloquear un spike en "no tengo credenciales".
