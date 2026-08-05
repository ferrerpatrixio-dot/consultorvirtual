# Spike DEV: Mercado Pago "Suscripciones con plan asociado" — Fase 5 (generador-bpmn)

**Autor:** DEV
**Fecha:** 2026-08-04
**Para:** PMcoordinador → Patricio Ferrer
**Relacionado:** `docs/VALIDACION-DEV-BPMN-DESDE-PROMPT.md` (riesgo 1: "spike de 1 día antes de comprometer la Fase 4/5 en firme"), `docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md` sección 2 y 5.

**Alcance de este documento:** spike de investigación (día acotado), NO implementación de producción. Variante técnica ya decidida por Patricio: **"Suscripciones con plan asociado"** — `POST /preapproval_plan` (una vez) → `POST /preapproval` (por cliente, con `card_token_id` y `status: "authorized"`).

---

## 1. Qué confirmé (documentación oficial de Mercado Pago Developers)

### 1.1 Tokenización client-side — la pregunta abierta que dejó Patricio

Confirmado: el nombre correcto es **MercadoPago.js V2**, con el componente **`CardForm`**.

- SDK: `@mercadopago/sdk-js` (npm) o CDN `https://sdk.mercadopago.com/js/v2`. Se inicializa con la **Public Key** (no el Access Token): `new MercadoPago("PUBLIC_KEY")`.
- Flujo: el frontend renderiza un formulario propio (número de tarjeta, vencimiento, CVV, nombre del titular, tipo/número de documento, cuotas — `installments` normalmente fijo en 1 para suscripción) y lo conecta al `CardForm`. Al enviarlo, el SDK genera un `card_token_id` de un solo uso, **válido 7 días**.
- **Confirma la sospecha de Patricio: no hay checkout hosteado para este flujo.** El `card_token_id` se genera en el navegador del cliente, pero **el backend sigue siendo obligatorio**: es quien recibe ese token y hace el `POST /preapproval` real con el Access Token (secreto, nunca en el frontend).
- Nota de seguridad favorable: el dato de tarjeta cruda nunca toca nuestro servidor — el `CardForm` lo envía directo al dominio de Mercado Pago. Esto acota el alcance PCI (relevante para SECURITY), pero sí implica que DEV construye y mantiene la UI del formulario (validaciones, estados de error de campo, estilos) — trabajo que con un checkout hosteado no existiría.

Fuente: [Generación del card token — Mercado Pago Developers](https://www.mercadopago.com.co/developers/es/docs/subscriptions/additional-content/cardtoken)

### 1.2 Webhooks — altas, cobros y fallos

Confirmado el patrón webhook → actualizar estado en BD, con **tres tópicos relevantes** a activar en el panel de la aplicación:

- **`subscription_preapproval`**: alta o cambio de estado de la suscripción misma (`pending` / `authorized` / `cancelled`).
- **`subscription_authorized_payment`**: eventos de cobro sobre una suscripción ya autorizada — esto es lo que avisa si el cobro mensual pasó o fue rechazado.
- **`payments`** (recomendado adicionalmente): notificación del pago individual asociado, consultable en detalle vía `GET /v1/payments/{id}` (`status`, `status_detail`, `date_approved`).

Es decir: **más de un tópico de webhook a manejar** (no uno solo como en un modelo simplificado), lo cual es un poco más de superficie que lo asumido en la Fase 4 original, aunque conceptualmente es el mismo patrón "webhook → update BD".

Fuentes: [Additional information about notifications](https://www.mercadopago.com.co/developers/en/docs/your-integrations/notifications/additional-info), [Subscriptions with authorized payment](https://www.mercadopago.com.co/developers/en/docs/subscriptions/integration-configuration/subscription-no-associated-plan/authorized-payments), [Payment management (conciliación)](https://www.mercadopago.com.mx/developers/es/docs/subscriptions/additional-content/payment-management)

### 1.3 Moneda CLP — formato de `transaction_amount`

Confirmado: **CLP debe enviarse como entero, sin decimales.** El peso chileno eliminó los centavos en 1984 y Mercado Pago documenta un grupo de monedas latinoamericanas (COP, HNL, NIO — mismo patrón cambiario que CLP) donde un monto decimal produce error de procesamiento. Para el precio de $9.990/mes, el valor correcto es `"transaction_amount": 9990, "currency_id": "CLP"` (no `9990.00`).

**Matiz honesto:** no encontré una línea oficial de Mercado Pago que liste explícitamente "CLP" en la tabla de monedas enteras (el ejemplo oficial de `/preapproval_plan` que pude leer usaba ARS con decimales, `24.5`). La conclusión de "CLP = entero" se apoya en (a) la convención monetaria chilena documentada fuera de Mercado Pago y (b) el patrón confirmado de otras monedas latinoamericanas sin decimales en la misma plataforma. **Recomiendo validar esto con una llamada real de prueba antes de comprometerlo en producción** — es justo el tipo de cosa que el resto de este spike no pudo terminar de confirmar (ver sección 2).

---

## 2. Qué NO pude probar — bloqueado, no simulado

Intenté completar la mitad práctica del spike (crear un `preapproval_plan` de prueba y, si era viable, una `preapproval` de prueba) contra el ambiente sandbox de Mercado Pago. Encontré el camino documentado para eso — **"cuentas de prueba"**, creadas dentro de una aplicación en el Developer Panel (`Tus integraciones` → tu app → `Cuentas de prueba` → `+ Crear cuenta de prueba`; se necesitan al menos una cuenta **Vendedor** y una **Comprador**, ambas del mismo país, con tarjetas de prueba documentadas para simular el cobro) — pero **no pude ejecutarlo yo mismo**, y no debo hacerlo:

- Ese primer paso (crear la "aplicación" en Mercado Pago Developers) requiere iniciar sesión en una cuenta real de Mercado Pago (la de Patricio) o crear una cuenta nueva. Ambas acciones — ingresar contraseñas para autenticar y crear cuentas — están fuera de lo que puedo hacer yo como agente, sin excepción aunque se autorice explícitamente.
- Verifiqué el repo: no hay ningún Access Token / Public Key de Mercado Pago en `generador-bpmn/.env.local` ni en `.env.example`, y el SDK de Mercado Pago (`mercadopago` npm) no está instalado en `package.json`. No hay ninguna credencial de prueba ya generada que yo pudiera reusar.

**Lo que falta para destrabar la mitad práctica del spike** (mismo patrón que faltó `ANTHROPIC_API_KEY` en la Fase 2): que **Patricio** (no yo) entre a `mercadopago.cl/developers` con su cuenta, cree una aplicación, genere ahí una cuenta de prueba Vendedor Chile + una Comprador Chile, y me pase las **credenciales de prueba** resultantes (Public Key `TEST-...` y Access Token `TEST-...` de la cuenta Vendedor). Con eso sí puedo ejecutar el `POST /preapproval_plan` y `POST /preapproval` reales contra sandbox y cerrar la validación de la sección 1.3 (formato CLP) con una respuesta real de la API en vez de inferencia documental.

No escribí ni dejé ningún script de prueba en el repo — no había credenciales contra las que probarlo, y no hay nada que limpiar.

---

## 3. Sizing actualizado de la Fase 5 (ex Fase 4 en el documento anterior)

Comparado con el sizing anterior (`VALIDACION-DEV-BPMN-DESDE-PROMPT.md`, **5 días-persona**, ya sin autogestión propia):

| Componente | Sizing anterior (implícito) | Sizing actualizado | Motivo del cambio |
|---|---|---|---|
| Backend: bootstrap `preapproval_plan` (una vez) | incluido | 0.5 d | Sin cambio de fondo, ahora más concreto |
| Backend: endpoint que recibe `card_token_id` y crea `preapproval` | asumido más simple (tipo checkout) | 1 d | Confirmado: el backend recibe el token del frontend, valida, llama `/preapproval` con Access Token |
| Backend: webhook receiver + verificación de firma + update BD | 1 tópico asumido | 1.5 d | Confirmado: son **dos tópicos** de suscripción (`subscription_preapproval`, `subscription_authorized_payment`) + `payments` recomendado, no uno solo |
| Middleware de gating `/app/*` según estado de suscripción | incluido | 0.5 d | Sin cambio |
| **Frontend: formulario de tarjeta propio (`CardForm` + SDK JS)** | **no estaba dimensionado** — se asumía algo más cercano a un checkout hosteado | **2 d** | **Este es el hallazgo nuevo del spike.** No existe checkout hosteado para "suscripción con plan asociado"; hay que construir, validar y estilizar un formulario propio de tarjeta (con los estados de error que devuelve el SDK) |
| Buffer de fricción manual en sandbox (confirma riesgo ya señalado en doc anterior) | — | 0.5–1 d | Sin CLI de simulación de eventos, ya documentado como riesgo, se mantiene |

**Total actualizado: ~6.5–7 días-persona** (vs. 5 estimados antes) — **sube, no baja**, y el motivo concreto es el que Patricio mismo anticipó al pedir esta investigación: la ausencia de checkout hosteado obliga a construir la captura de tarjeta propia, que no estaba en el sizing original porque no se había confirmado que hiciera falta.

Esto no cambia la conclusión de fondo de "Mercado Pago sí resuelve el problema" (documento anterior, Hallazgo 1) — solo ajusta el número con datos más firmes. El +1.5 a +2 días-persona resultante sube el total de v1 de 20 a **~21.5–22 días-persona** (de los ~4 semanas calendario estimadas antes, pasa a ~4.3–4.4 semanas), dentro del buffer de 4.5–5 semanas que ya se había recomendado comprometer con Patricio — **no hace falta renegociar el compromiso de timeline**, el buffer ya lo absorbe.

La validación práctica pendiente (sección 2) podría todavía mover este número, sobre todo si el formato CLP o algún comportamiento de `CardForm` en sandbox chileno resulta distinto a lo documentado — por eso sigo recomendando cerrar esa prueba real antes de arrancar la implementación en firme de la Fase 5.

---

## 4. Qué hace falta para desbloquear (resumen accionable)

1. **Patricio** crea una aplicación en `mercadopago.cl/developers` (o confirma que ya tiene una) con su cuenta real.
2. Dentro de esa aplicación, crea una cuenta de prueba **Vendedor (Chile)** y una **Comprador (Chile)**.
3. Me pasa el **Public Key** y **Access Token de prueba** (`TEST-...`) de la cuenta Vendedor.
4. Con eso, cierro la mitad práctica de este spike: `preapproval_plan` + `preapproval` reales contra sandbox, confirmando en particular el formato CLP (sección 1.3).

No se tocó `sistemaaiprocess/`. No se instalaron dependencias nuevas en `generador-bpmn/package.json` (no hizo falta para la parte de investigación; `@mercadopago/sdk-js` y `mercadopago` (npm, backend) quedan pendientes de instalar recién cuando arranque la implementación real de la Fase 5). No se hizo `git add`/`git commit`.

---

## 5. Evaluación 2026-08-04: ¿Checkout Bricks en vez de CardForm para bajar el sizing?

**Autor:** ARQUITECTO IT
**Motivo:** Patricio pasó documentación oficial de Mercado Pago sobre las 4 variantes de integración de Checkout API (Checkout Bricks "Fácil", CardForm "Medio", Core Methods Web/Mobile "Alto") y preguntó si conviene usar Checkout Bricks en vez de CardForm para bajar los +2 días de UI que este spike agregó al sizing.

### 5.1 La pregunta técnica central: ¿el token del Card Payment Brick sirve para `POST /preapproval`?

**No hay confirmación documental end-to-end.** Busqué específicamente un tutorial o ejemplo oficial que combine "Card Payment Brick" con `POST /preapproval` (suscripciones) y no lo encontré. Lo que sí confirmé, con fuentes:

- La página oficial de generación de card token para Suscripciones (la misma que usé en la sección 1.1 para confirmar CardForm) menciona el Card Payment Brick como alternativa, aunque en términos genéricos: *"Además de las opciones disponibles en esta documentación, también es posible integrar pagos con tarjeta utilizando el Brick de Card Payment"* — sin decir explícitamente que ese token sirva para crear una `preapproval`. Fuente: [Generación del card token — Suscripciones](https://www.mercadopago.com.co/developers/es/docs/subscriptions/additional-content/cardtoken).
- El `onSubmit` del Card Payment Brick devuelve un `formData.token` descrito con las mismas características que el `card_token_id` de CardForm: uso único, expira en 7 días. Fuente: [Card Payment Brick — Payment submission](https://www.mercadopago.com.ar/developers/en/docs/checkout-bricks/card-payment-brick/payment-submission).
- El recurso "card token" (`POST /v1/card_tokens`, subyacente a ambos componentes) es un recurso genérico de Mercado Pago, no atado a un tipo de pago — se documenta tanto para pagos (`/v1/payments`) como para suscripciones (`card_token_id` en `/preapproval`).

**Conclusión honesta:** técnicamente es plausible que el token del Brick funcione para `/preapproval` — mismo tipo de recurso, y la documentación de suscripciones sí referencia al Brick como alternativa de captura de tarjeta. Pero **no hay un ejemplo oficial ni una línea explícita de Mercado Pago que confirme esa combinación puntual** ("Card Payment Brick" + "suscripción con plan asociado"). Es inferencia razonable, no un hecho documentado. Toda la documentación de suscripciones que sí trae ejemplos de código usa CardForm, no Bricks.

### 5.2 El dato de testing que ya pesa en la decisión

Como ya señaló Patricio: Checkout Bricks **no soporta "cuentas de prueba"** — tiene su propio flujo separado de "Hacer compra de prueba". Si se adoptara Bricks, la Fase 5 quedaría con **dos flujos de sandbox distintos conviviendo**: "compra de prueba" para la captura de tarjeta, y "cuentas de prueba" para todo lo demás (webhooks, backend, conciliación de pagos). Esto no es un detalle menor: la sección 2 de este mismo spike ya señaló la fricción de sandbox como el riesgo no resuelto de la Fase 5 (buffer de 0.5–1 día ya reservado por eso). Fragmentar el flujo de pruebas lo empeora, no lo simplifica.

### 5.3 Recomendación: mantener CardForm, no cambiar a Checkout Bricks

**No conviene cambiar.** Motivo principal: la combinación Card Payment Brick + `POST /preapproval` no está confirmada por documentación oficial de Mercado Pago — es una inferencia técnica razonable (mismo recurso "card token" genérico), no un flujo documentado con ejemplo end-to-end. Construir sobre una combinación no verificada, en la única pieza de la Fase 5 que ya se identificó como no probable en sandbox sin credenciales reales (sección 2), es agregar un riesgo nuevo en vez de sacar uno.

A eso se suma que, aunque funcionara, el ahorro de esfuerzo no está claro: Bricks trae una UI predefinida (evita parte del trabajo de estilizar formulario y manejar estados de error a mano que hoy pesan en los 2 días de CardForm), pero exige aprender e integrar un componente nuevo, validar que efectivamente genera un token válido para `/preapproval` (ya que no hay ejemplo oficial que lo confirme), y cargar con un segundo flujo de sandbox ("compra de prueba") distinto al resto de la Fase 5. Ese costo adicional de validación e integración compite directamente con el ahorro de UI que se buscaba, y el rótulo "Fácil" que trae la documentación de Patricio es sobre Checkout API genérico (pagos únicos vía `/v1/payments`), no sobre esta variante específica de suscripciones — no corresponde aplicarlo sin más a un caso de uso que la documentación no confirma.

**El sizing de la sección 3 no cambia.** Se mantiene CardForm tal como ya lo scopeó DEV, y el total sigue en **~6.5–7 días-persona** para la Fase 5. Si en algún momento Mercado Pago publica un ejemplo oficial confirmando Card Payment Brick + `/preapproval`, vale la pena reabrir esta pregunta — hoy no hay base documental firme para comprometer el cambio.

**Fuentes consultadas en esta evaluación (2026-08-04):**
- [Card Payment Brick — Introduction](https://www.mercadopago.com.br/developers/en/docs/checkout-bricks/card-payment-brick/introduction)
- [Card Payment Brick — Payment submission](https://www.mercadopago.com.ar/developers/en/docs/checkout-bricks/card-payment-brick/payment-submission)
- [Generación del card token — Suscripciones](https://www.mercadopago.com.co/developers/es/docs/subscriptions/additional-content/cardtoken)
- [Subscriptions with associated plan](https://www.mercadopago.com.ar/developers/en/docs/subscriptions/integration-configuration/subscription-associated-plan)
- [Subscriptions with authorized payment](https://www.mercadopago.com.co/developers/en/docs/subscriptions/integration-configuration/subscription-no-associated-plan/authorized-payments)
