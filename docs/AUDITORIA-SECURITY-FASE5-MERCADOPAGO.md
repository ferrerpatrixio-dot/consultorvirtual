# Auditoría SECURITY — Fase 5 generador-bpmn (suscripciones Mercado Pago)

**Fecha:** 2026-08-04
**Alcance:** commit `ad486d6` ("Fase 5 generador-bpmn: suscripción Mercado Pago implementada"), rama `master`.
**Auditor:** SECURITY agent (CONSULTORAVIRTUAL)
**Método:** revisión de código estático (sin `tsc`/build — ya verificado por DEV/PM) + verificación contra documentación oficial de Mercado Pago Developers y de Next.js.

Archivos revisados: `prisma/schema.prisma`, `src/lib/mercadopago.ts`, `src/lib/session.ts`,
`src/app/suscripcion/{page.tsx,SuscripcionForm.tsx,actions.ts}`,
`src/app/api/webhooks/mercadopago/route.ts`, `src/app/(app)/layout.tsx`,
`src/app/(app)/actions.ts`, `src/app/api/diagramas/[id]/exportar/route.ts`, `.env.example`,
`.gitignore`, `docs/SPIKE-MERCADO-PAGO-BPMN-DESDE-PROMPT.md`, `docs/referencia/MERCADO-PAGO.md`.

---

## Resumen ejecutivo

Se encontró **un hallazgo crítico no reportado por DEV**: el paywall de Fase 5 se puede
saltar por completo llamando directamente a los Server Actions de creación/edición/borrado de
diagramas y de generación por IA — no dependen de `requireActiveSubscription`, solo de
`requireUser`. Esto **bloquea el lanzamiento a producción con cobro real** hasta corregirse.

Los dos gaps que DEV ya había dejado explícitos se confirmaron y se reevaluó su severidad real:
la falta de verificación de firma del webhook es real pero su impacto está bastante acotado por
un patrón de diseño correcto (nunca confía en el payload, siempre re-consulta el estado real a
Mercado Pago) — no bloquea el lanzamiento por sí sola, pero debe cerrarse antes de escalar
tráfico. El endpoint `GET /authorized_payments/{id}` sí existe y está documentado oficialmente
— la incertidumbre de DEV queda resuelta.

PCI, manejo de datos personales (Ley 19.628) y secretos en git se revisaron y están correctos.

---

## 🔴 CRÍTICO

### 1. Paywall completo evadible vía Server Actions de `src/app/(app)/actions.ts`

**Qué es:** Las 9 funciones exportadas en `src/app/(app)/actions.ts`
(`crearDiagramaAction`, `generarDesdePromptAction`, `actualizarMetaAction`,
`eliminarDiagramaAction`, `agregarActorAction`, `quitarActorAction`, `agregarPasoAction`,
`actualizarPasoAction`, `quitarPasoAction`) llaman todas a `requireUser()` (solo exige login),
**ninguna llama a `requireActiveSubscription()`** (login + `subscriptionStatus === "authorized"`).

El único punto que sí exige suscripción activa es `src/app/(app)/layout.tsx`, que envuelve el
**render** de las páginas `/dashboard` y `/diagramas/*`. Pero en Next.js App Router, un Server
Action (`"use server"`) es un endpoint HTTP público independiente: se invoca con un POST directo
identificando la función por su Action ID, y esa invocación **no re-ejecuta el layout padre**
como gate de autorización. Es la advertencia de seguridad oficial de Next.js: *"Treat Server
Actions as public HTTP endpoints... you must implement explicit authentication and authorization
checks within every Server Action"* ([Next.js — Data Security](https://nextjs.org/docs/app/guides/data-security)).

**Por qué importa:** un usuario logueado con `subscriptionStatus` en `null`/`pending`/`paused`/
`cancelled` (es decir, cualquiera que se registre con Google OAuth y nunca pague, o cuya
suscripción se cancele) puede:
- Crear, editar y borrar diagramas ilimitadamente — el producto completo, gratis.
- Invocar `generarDesdePromptAction`, que llama a `extraerProcesoDesdePrompt` (Claude API) —
  **esto además genera costo real de API por cada llamada**, sin que la persona haya pagado ni
  un peso. Es vector de abuso de costos, no solo de acceso.

Este gap es preexistente a Fase 5 (el archivo viene de Fase 1/2, cuando no existía el concepto
de suscripción), pero **Fase 5 lo convirtió en un bypass de paywall real** porque ahora sí hay
algo que pagar y algo que evadir. No estaba entre los dos gaps que DEV había dejado documentados
— es un hallazgo nuevo de esta auditoría.

**Qué hacer (bloqueante antes de cobrar a usuarios reales):**
Cambiar, en `src/app/(app)/actions.ts`, el `import { requireUser }` por
`import { requireActiveSubscription }` y reemplazar las 9 llamadas `requireUser()` por
`requireActiveSubscription()`. Nota para quien lo implemente (DEV): `requireActiveSubscription`
redirige a `/suscripcion` en vez de `/` — repasar que ese redirect tenga sentido dentro de una
Server Action (algunas de estas acciones no navegan, ej. `agregarActorAction`); puede requerir
devolver un estado de error en vez de `redirect()` en esos casos. No lo apliqué yo mismo porque
es un cambio de 9 sitios con implicancia de comportamiento, no un one-liner evidente — queda para
DEV, con este detalle ya mapeado.

No se encontraron otras rutas bajo `/diagramas/*` o `/dashboard` sin cubrir aparte de ésta: las
páginas (`page.tsx`) si están protegidas por el layout; el problema es exclusivamente los Server
Actions.

---

## 🟠 ALTO (no bloqueante por sí solo, pero prioritario antes de escalar tráfico)

### 2. Webhook sin verificación de firma (`MERCADOPAGO_WEBHOOK_SECRET` no configurado)

**Confirmado:** `src/app/api/webhooks/mercadopago/route.ts` no valida el header `x-signature`.
Cualquiera que descubra la URL puede mandar un POST con `{type, data.id}` arbitrario.

**Evaluación de impacto real (no es tan grave como suena en aislado):** el código **no confía
en el `status` del payload del webhook** — ante cualquier tópico, siempre hace un `GET` real a
la API de Mercado Pago (`obtenerPreapproval` / `obtenerPagoAutorizado`) autenticado con nuestro
propio `MERCADOPAGO_ACCESS_TOKEN`, y solo escribe en la base el estado que Mercado Pago devuelve
de verdad. Consecuencia: un atacante **no puede forjar** un `subscriptionStatus: "authorized"`
falso enviando un webhook falso — como mucho, puede forzar que releamos el estado real (ya
correcto) de un `preapproval_id` que además tendría que adivinar (no es secuencial ni
enumerable a simple vista). No hay escalación de privilegios ni bypass de pago posible por esta
vía con el código actual.

Riesgo residual real: (a) abuso de recursos — spamear el endpoint fuerza llamadas salientes
innecesarias a la API de Mercado Pago, con riesgo de rate-limit que afecte el procesamiento de
notificaciones legítimas; (b) es una capa de defensa-en-profundidad ausente que Mercado Pago
recomienda explícitamente (firma HMAC documentada en el panel de la Aplicación → Webhooks); (c)
si en el futuro alguien modifica este handler para confiar más directamente en el payload (ej.
por una refactorización apurada), la ausencia de verificación de firma pasa a ser explotable de
verdad — hoy la única razón de que no lo sea sensible es el patrón "siempre re-consultar",
no una barrera propia del endpoint.

**Qué hacer:** implementar verificación de `x-signature` con `MERCADOPAGO_WEBHOOK_SECRET` antes
de que el endpoint reciba tráfico de producción a volumen (ya está documentado el
`.env.example` con el comentario correcto). No es tan urgente como el hallazgo #1 porque no
permite bypass de pago, pero debe entrar en el mismo ciclo de fix.

### 3. `GET /authorized_payments/{id}` — incertidumbre de DEV resuelta

Confirmado contra la [referencia oficial de Mercado Pago Developers](https://www.mercadopago.com.br/developers/en/reference/online-payments/subscriptions/get-authorized-payment/get):
el endpoint `GET /authorized_payments/{id}` existe, está documentado, y es exactamente el que
usa `obtenerPagoAutorizado` en `src/lib/mercadopago.ts`. **No es un gap real** — se puede quitar
la advertencia "endpoint NO confirmado" del comentario en ese archivo (cosmético, no lo toqué
por no ser mi código a editar sin pedir).

Manejo de fallas: si esa llamada falla (404, cambio de contrato, etc.), el `try/catch` de
`route.ts` lo traga con `console.error` y responde `200 ok` igual — esto es intencional y
correcto para evitar reintentos infinitos de Mercado Pago, pero significa que una falla
sistemática en este único tópico (`subscription_authorized_payment`) sería **silenciosa**, sin
alerta. Impacto acotado: `subscription_preapproval` sigue siendo la fuente primaria de verdad
del estado de suscripción y no depende de este endpoint. Recomendación de monitoreo, no
bloqueante: agregar algo más que `console.error` (alerta o log estructurado) antes de depender
de este tópico en un incidente real.

---

## 🟡 MEDIO

### 4. Errores de procesamiento del webhook solo van a `console.log`, sin alerta

Aplica en general al `catch` de `route.ts` (línea 67-72): cualquier falla al actualizar
`subscriptionStatus` (timeout de red a Mercado Pago, cambio de contrato de la API, etc.) se
loguea a consola y no se reintenta (por diseño, correcto) ni se alerta a nadie. Si pasa, el
usuario queda con estado desincronizado hasta que recargue `/suscripcion` — la propia página ya
avisa "espera un momento y recarga" (`page.tsx` línea 29-35), lo cual mitiga la experiencia,
pero el equipo no se entera de que está pasando. Bajo impacto (no es de seguridad, es
operacional), mencionado porque cae dentro del alcance de auditoría/monitoreo del rol SECURITY.

---

## ✅ Verificado correcto (sin hallazgos)

- **PCI / datos de tarjeta:** confirmado leyendo `SuscripcionForm.tsx` línea por línea — los
  campos de tarjeta (`cardNumber`, `expirationDate`, `securityCode`) son `<div>` vacíos que
  MercadoPago.js monta como iframes; el único dato que llega al código de la app es
  `cardForm.getCardFormData().token` (línea 72), pasado a `crearSuscripcionAction(token)`. El
  número de tarjeta, CVV y vencimiento nunca entran al DOM controlado por React ni al backend.
  Consistente con lo documentado en `docs/referencia/MERCADO-PAGO.md` sección 3 (PCI SAQ A vía
  iframe directo a Mercado Pago).
- **Ley 19.628 — almacenamiento/exposición de datos personales:** `payer_email` se envía a
  Mercado Pago pero no se persiste en la tabla `User` (solo `mercadopagoPreapprovalId` y
  `subscriptionStatus`, que reflejan estado de negocio, no dato financiero sensible en sí). No
  se encontró ningún endpoint que devuelva el registro completo de `User` al cliente; el único
  dato de suscripción expuesto en UI es el propio `subscriptionStatus` del usuario logueado
  (`suscripcion/page.tsx`), a él mismo. El único `console.error` del flujo de pago
  (`route.ts` línea 71) loguea `topic` y `resourceId` (IDs de Mercado Pago), no email ni datos de
  tarjeta ni tokens.
- **Control de acceso — cobertura de rutas:** todas las páginas bajo `/diagramas/*` y
  `/dashboard` cuelgan del grupo `(app)` y pasan por `requireActiveSubscription` en el layout
  (ver hallazgo #1 para la excepción real, que son los Server Actions, no las páginas). Las
  queries de `actions.ts` ya filtran por `userId` (`diagramaDelUsuario`), así que aunque el gap
  #1 permite operar sin pagar, **no permite acceder a diagramas de otro usuario** — es bypass de
  paywall, no horizontal privilege escalation entre cuentas.
- **Webhook — vínculo a usuario correcto:** `actualizarEstadoPorPreapproval` usa `updateMany`
  filtrando por `mercadopagoPreapprovalId` (columna `@unique` en el schema), así que no hay
  riesgo de que un ID ambiguo pise el estado de dos usuarios distintos.
- **Secretos:** `git check-ignore -v .env.local` confirma que está ignorado
  (`.gitignore:25`). `git ls-files | grep env` solo devuelve `.env.example` (sin valores reales).
  No se encontraron tokens/keys hardcodeados en `src/`, `scripts/` ni en el resto del repo
  (`APP_USR-`, `TEST-` con longitud de credencial real, `access_token: "..."` literal — ninguno
  presente).

---

## Veredicto de producción

- **Bloquea producción con cobro real:** hallazgo #1 (paywall evadible). No lanzar cobro a
  usuarios reales hasta corregirlo — de lo contrario el modelo de negocio de Fase 5 no tiene
  efecto práctico.
- **No bloquea, pero corregir antes de escalar tráfico/marketing:** hallazgo #2 (firma de
  webhook) y, en menor medida, #4 (alertas de errores del webhook).
- **Sin acción necesaria:** hallazgo #3 es informativo (resuelve una duda de DEV), y la sección
  "Verificado correcto" no requiere cambios.
