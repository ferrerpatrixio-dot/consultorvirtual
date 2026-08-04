# Propuesta: Generador de Diagramas BPMN desde Prompt (SaaS, Línea de Negocio 3)

**Autor:** ARQUITECTO
**Fecha:** 2026-08-02
**Para:** PM (Patricio Ferrer)
**Relacionado:** Línea de Negocio 3 (suscripción) · reutiliza `apps/generador-diagramas.html` y skill `bpmn-architect`

---

## Estado Actual (as-is)

- **Prototipo `generador-diagramas.html`**: standalone, sin backend, sin login. El analista carga actores y pasos a mano en una tabla HTML; el motor JS arma Mermaid (`flowchart TD` con `subgraph` por actor) y lo renderiza client-side. No hay "prompt en lenguaje natural" — es un formulario estructurado. Buen motor de render, cero inteligencia de extracción.
- **Skill `bpmn-architect`** (en el proyecto ajeno "PROCESOS BPMN", solo lectura): es un *prompt de sistema* para un LLM, no código. Define un JSON rico (`nodes`/`edges`, `lane`, `visual_meta`, `technical_meta.retry_strategy`, `is_idempotent`, `pending_questions`) pensado para BPMN 2.0 ejecutable (Camunda/Bonita). Nadie lo consume hoy — es una especificación, no un servicio.
- **`sistemaaiprocess`** (producto hermano, mismo dueño): Next.js 16 + React 19 + Prisma + Postgres (vía Supabase) + Auth.js v5 con Google OAuth (`src/auth.ts`) + Upstash rate-limit. Self-hosted en VPS/EasyPanel (no Vercel — el propio código lo dice: `trustHost: true, // self-hosting (EasyPanel/VPS)`). **No tiene Stripe ni ningún flujo de pago** — solo login. Esto corrige el memo de referencia que asumía Vercel.
- **Problema a resolver:** no existe hoy ningún camino de "prompt libre → BPMN". Todo el trabajo de estructuración es manual.

## Estado Futuro (to-be)

Un SaaS de suscripción, **acceso cerrado** (login obligatorio + plan de pago activo), donde el analista escribe una descripción del proceso en lenguaje natural, un LLM la convierte en un JSON estructurado (actores, pasos, decisiones), y esa estructura se renderiza como diagrama BPMN editable (carriles por actor, colores 60-30-10). El usuario puede corregir el resultado a mano antes de exportar (PNG/PDF/Mermaid), igual que hoy puede hacerlo en el prototipo.

---

## 1. Arquitectura "prompt → BPMN"

```
Usuario escribe prompt libre
        │
        ▼
┌─────────────────────────────┐
│ (a) LLM: extracción          │  Claude API, structured output (JSON schema)
│     prompt → JSON de proceso │  1 sola llamada, sin function-calling multi-turno
└──────────────┬───────────────┘
               ▼
┌─────────────────────────────┐
│ (b) Motor de render          │  Mismo algoritmo del prototipo:
│     JSON → Mermaid → SVG     │  actores→subgraph, pasos→nodos, tipo→forma+color
└──────────────┬───────────────┘
               ▼
┌─────────────────────────────┐
│ (c) Edición manual            │  Tabla de pasos (ya existe en el prototipo) para
│     post-generación            │  corregir lo que el LLM interpretó mal
└──────────────┬───────────────┘
               ▼
        Export (PNG/PDF/Mermaid)
```

**Esquema JSON: híbrido, no el rico completo.** Decisión clave de esta propuesta.

- El esquema de `bpmn-architect` (BPMN 2.0 ejecutable: `retry_strategy`, `is_idempotent`, `technical_meta`) está diseñado para **automatización backend exportable a motores de ejecución** (Camunda/Bonita) — resuelve un problema que este producto no tiene. Un analista de procesos dibujando un flujo para documentar/comunicar no necesita idempotencia de API ni backoff exponencial.
- El esquema del prototipo (actor/tipo/texto/destino) es plano y ya probado, pero le falta lo mínimo que un LLM sí necesita para no alucinar: un id estable por paso y una razón para las decisiones.
- **Híbrido propuesto:** el schema del prototipo (`actor`, `tipo`, `texto`, `siguiente`/`siguienteSi`/`siguienteNo`) + tres campos tomados de `bpmn-architect`: `id` (ya existe), `lane` (=actor, redundante pero explícito para el LLM) y `pending_questions` (array a nivel de diagrama) para el método socrático — cuando el LLM no puede inferir una rama de decisión con confianza, en vez de inventarla, la deja vacía y agrega la pregunta a esa lista, que se muestra al usuario como "esto no quedó claro, complétalo tú". Se descarta `technical_meta`/`retry_strategy`/`is_idempotent`: no aplican a este producto y añaden complejidad que nadie va a usar.
- El prompt de sistema para el LLM es una adaptación de `bpmn-architect` recortada a este esquema — no se reescribe desde cero, se poda.

**(c) Edición manual: se mantiene como red de seguridad, no como opcional.** El LLM va a fallar (loops mal inferidos, decisiones ambiguas, actor equivocado) más seguido de lo que un cliente pagante tolera sin poder corregir. La tabla de edición del prototipo pasa de ser "la forma de crear el diagrama" a "la forma de arreglarlo después de que el LLM lo generó". Es la misma UI, cambia el punto de entrada.

## 2. Decisión de stack

| Capa | Elección | Por qué |
|---|---|---|
| Frontend + Backend | **Next.js** (App Router), mismo framework que `sistemaaiprocess` | Un solo stack que el DEV ya conoce y opera; no hay razón para introducir uno nuevo para un producto hermano. |
| LLM | **API de Claude** (Anthropic), no la CLI de Claude Code | La empresa ya integra `@anthropic-ai/sdk` en `sistemaaiprocess` (ver `package.json`) — hay experiencia de equipo y llaves ya gestionadas. "Ya se usa Claude Code" es una razón de comodidad del equipo, no un motivo técnico: el producto necesita la **API** (`messages.create` con structured output/JSON schema), que es un servicio distinto pero de la misma familia y facturación. |
| Render del diagrama | **Mermaid.js** (mismo motor del prototipo), corriendo client-side | Ya funciona, ya tiene la semántica de color aprobada. Reescribir el render a un motor BPMN 2.0 real (bpmn-js) es sobre-ingeniería para v1: el objetivo es "ver el proceso claro", no "ejecutarlo en un motor de workflow". |
| Base de datos | **Postgres vía Supabase**, mismo proveedor que `sistemaaiprocess` | Ya hay cuenta y patrón de uso. Prisma como ORM, igual que el hermano. |
| Auth | **Auth.js v5**, mismo patrón que `sistemaaiprocess/src/auth.ts` | Se copia casi literal (adapter Prisma + Google + JWT). Cero curva de aprendizaje. |
| Pagos/suscripción | ~~Stripe Billing~~ → **Mercado Pago** (decisión final, ver pregunta 3 en sección 5 y "Actualización 2026-08-02"/"2026-08-04" más abajo) | Elección original de esta tabla (Stripe) quedó revertida el 2026-08-02: Mercado Pago prioriza encaje con medios de pago chilenos (Webpay percibido, transferencia) sobre menor esfuerzo de integración — su modelo de suscripción recurrente (`preapproval`) es más manual que el Customer Portal de Stripe, ya factorizado en el sizing. Confirmado 2026-08-04 que la misma cuenta/API sirve para expansión LATAM (México, Colombia, Perú, Argentina) cuando se decida entrar a esos mercados — ver `docs/VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md` sección 7. |
| Hosting | **VPS/EasyPanel**, mismo servidor que `sistemaaiprocess` | Ya pagado, ya operado, cero curva. Evita duplicar infraestructura de hosting para un producto del mismo tamaño. |

No se propone stack nuevo en ninguna capa salvo Stripe, que es inevitable porque hoy no existe nada de cobro en la casa.

## 3. Modelo de acceso cerrado (login + suscripción)

- **Login**: esfuerzo bajo. Se clona el patrón de `sistemaaiprocess/src/auth.ts` (Auth.js + Prisma adapter + Google OAuth). Es copiar y adaptar, no diseñar de cero. ~1 día.
- **Suscripción de pago**: esfuerzo medio-alto, y es la pieza que **no existe en ningún producto de la casa hoy**. Implica: Stripe Checkout (alta de suscripción), webhook de Stripe → actualizar estado del usuario en la BD (`active`/`past_due`/`canceled`), Customer Portal (para que el usuario cancele/actualice tarjeta sin que nosotros construyamos esa UI), y middleware que bloquee el acceso a `/app/*` si no hay suscripción activa. Sin tiers al inicio — un solo plan mensual (ver pregunta pendiente #3 sobre precio).
- **No hay nada que reutilizar de `sistemaaiprocess` en la parte de pagos** porque no la tiene. Esto es la pieza nueva real del proyecto, y es la que más se parece a "construir de cero" dentro de esta propuesta.

## 4. Qué se reutiliza literalmente vs qué se reescribe

**Se reutiliza casi literal (copiar y adaptar, no reescribir):**
- Toda la función `generarMermaid()` del prototipo (líneas 381-424): slugify de actores, `subgraph` por carril, forma de nodo por tipo, `classDef` de colores 60-30-10. Es el corazón del render y ya está validado.
- El modelo de datos de pasos (`actor`, `tipo`, `texto`, `siguiente*`) y la tabla de edición (`renderPasos()` + `actualizarPaso()`), que pasa a ser el editor post-generación.
- La paleta y semántica visual (verde/azul/gris/ámbar/rojo), ya aprobada y coherente con lo que también propone `bpmn-architect`.

**Se reescribe / se agrega:**
- Todo el frontend pasa de HTML+JS plano a componentes Next.js/React (server actions para llamar al LLM y guardar el diagrama; no tiene sentido mantener JS vanilla en un stack Next.js).
- La capa de extracción prompt→JSON es 100% nueva (no existe hoy en ningún activo).
- Persistencia: el prototipo no guarda nada (todo vive en memoria del navegador); el SaaS necesita guardar diagramas por usuario en la BD.
- Todo lo de auth + suscripción (nuevo, ver sección 3).
- Export a PDF: el prototipo usa `window.print()` (control-P del navegador). Sirve como v1 también aquí; no vale la pena construir un exportador propio todavía.

## 5. Preguntas pendientes (método socrático) — requieren decisión de Patricio

1. **Precio y modelo de suscripción.** No hay ningún dato de pricing SaaS en `CATALOGO-SERVICIOS.md`/`VALORES-TIPO-COTIZACION.md` — esos documentos cotizan proyectos de consultoría por banda, no suscripciones de software. ¿Cuánto se cobra al mes, hay trial gratis, hay límite de diagramas por mes en el plan base? **Esto es decisión de PRODUCT MANAGER + Patricio, no del ARQUITECTO** — lo escalo, no lo invento.
2. **¿Multi-tenant desde el día 1 o mono-usuario primero?** Si el plan es venderlo a "analistas de procesos" como clientes externos plurales, hay que decidir si cada cuenta ve solo sus propios diagramas (aislamiento por `userId`, ya lo resuelve el patrón de `sistemaaiprocess`) o si además hace falta compartir diagramas dentro de un mismo equipo/empresa cliente (eso sí es una decisión de alcance mayor: multi-tenant con roles).
3. **Stripe vs. Mercado Pago para Chile.** Recomiendo Stripe por menor esfuerzo de integración de suscripciones recurrentes, pero si la base de clientes es mayoritariamente chilena y prefiere pagar con métodos locales (Webpay, transferencia), Mercado Pago puede convenir más comercialmente aunque cueste más construirlo. Necesito el criterio de COMERCIAL/PRODUCT MANAGER sobre qué medio de pago espera el cliente objetivo.
4. **¿Qué tan "libre" es el prompt?** ¿Se espera que el usuario escriba un párrafo suelto, o se le da una guía tipo "actor: ..., pasos: ..." para ayudar al LLM a acertar? Un prompt totalmente libre tiene más fricción de UX buena pero más riesgo de que el LLM extraiga mal; una guía estructurada reduce error pero se parece más al formulario que ya existe. Afecta directamente el diseño de UX — necesito input de DISEÑADOR-UX antes de fijar esto.
5. **Alcance de exportación v1.** ¿Basta con PNG/print-to-PDF (como hoy) o el cliente pagante espera exportar a `.bpmn` (XML) para importarlo en otra herramienta? Si es lo segundo, sube el tamaño del proyecto de M a L porque implica generar BPMN 2.0 XML real, no solo Mermaid — y ahí sí empieza a justificarse mirar el esquema rico de `bpmn-architect`.

**Ninguna de estas preguntas es una escalación por presupuesto** (el proyecto completo, ver Costo Estimado, no supera el umbral de $5K de la matriz) **ni un cambio de alcance sobre lo ya encargado** — son decisiones de producto que Patricio/PRODUCT MANAGER deben fijar antes de que DEV empiece a codear, porque cambian el diseño de datos y de UX, no la arquitectura técnica en sí.

## 6. T-shirt sizing

| Fase | Tamaño | Contenido |
|---|---|---|
| 1. Auth + estructura Next.js + persistencia de diagramas | **S** | Clonar patrón `sistemaaiprocess/src/auth.ts`, modelo Prisma (User, Diagram), CRUD básico |
| 2. Motor prompt→JSON (Claude API) + adaptación de `generarMermaid()` a React | **M** | Prompt de sistema (poda de `bpmn-architect`), llamada a Claude con JSON schema, port del render a componente |
| 3. Editor post-generación (tabla de ajuste) | **S** | Casi copiar el prototipo tal cual, en React |
| 4. Suscripción de pago (Stripe Checkout + webhook + portal + gating) | **M** | Pieza nueva, sin precedente interno que copiar |
| 5. QA + SECURITY (compliance Ley 19.628 sobre datos de proceso de clientes) + Delivery | **S** | Mismo rigor que cualquier producto, ver MATRIZ_AGENTES |

**Total proyecto: M** (ni S por la pieza de pagos que es nueva, ni L porque casi todo lo demás se reutiliza o se copia de un patrón ya operado). Estimado en semanas de trabajo, no meses — pero el tamaño exacto en tiempo lo debe validar DEV antes de comprometer fecha con Patricio, según el protocolo de la matriz (ARQUITECTO propone, DEV valida factibilidad y tiempo).

## Riesgos

- **Calidad de extracción del LLM**: prompts ambiguos o mal escritos generan diagramas incorrectos. Mitigado por el editor post-generación (sección 1c) y por `pending_questions`. Riesgo residual: percepción de "IA que no entiende" si la UX no comunica bien que hay que revisar el resultado.
- **Pagos es la pieza sin precedente**: es donde más probabilidad hay de subestimar tiempo, porque ningún producto de la casa lo ha hecho antes. Recomiendo que DEV haga spike de 1 día en Stripe Checkout + webhook antes de comprometer el sizing de la Fase 4.
- **Costo de API de Claude por uso**: cada generación de diagrama consume tokens. Sin un límite por plan (pregunta pendiente #1), un usuario podría generar cientos de diagramas y erosionar margen. Necesita un límite (ej. N generaciones/mes) atado al plan de suscripción, no solo gating de acceso binario.

## Decisiones de Patricio (2026-08-02)

PM coordinó estas respuestas directamente con Patricio sobre las 5 preguntas pendientes (sección 5):

| Pregunta | Decisión |
|---|---|
| 1. Precio/suscripción | **Infraestructura de gating lista con precio placeholder editable.** Precio real se fija con PRODUCT MANAGER antes del lanzamiento público, no bloquea el desarrollo. |
| 2. Multi-tenant vs mono-usuario | **Mono-usuario primero.** Se reutiliza el patrón de aislamiento por `userId` de `sistemaaiprocess`, sin roles de equipo en v1. |
| 3. Proveedor de pago | **Mercado Pago**, no Stripe. Prioriza encaje con medios de pago chilenos (Webpay, transferencia) sobre menor esfuerzo de integración. **Impacto:** el flujo de suscripción recurrente de Mercado Pago es más manual que Stripe Billing (no tiene un "Customer Portal" equivalente listo) — DEV debe re-evaluar el esfuerzo de la Fase 4 con este proveedor específico, no asumir el mismo sizing que se estimó para Stripe. |
| 4. Libertad del prompt | Sin decidir aún — queda para DISEÑADOR-UX, no era una decisión de Patricio. |
| 5. Alcance de exportación v1 | ~~También exportar a `.bpmn` XML real~~ → **Revisado 2026-08-02 tras validación de DEV: v1 lanza solo con PNG/PDF.** DEV cuantificó el costo real (+6 días-persona, ~1.2 semanas, más el riesgo de una librería de adopción menor) y Patricio decidió mover la exportación XML a **fase 2 post-MVP**. La investigación técnica ya está hecha (`bpmn-moddle` + `bpmn-auto-layout` cubren el mapeo sin construir un layout engine propio) y documentada en `docs/VALIDACION-DEV-BPMN-DESDE-PROMPT.md` — no hay que rehacerla cuando se retome. → **Revisado nuevamente 2026-08-04: XML vuelve al alcance de v1**, ver sección "Actualización 2026-08-04" más abajo. |

**Siguiente paso (histórico, 2026-08-02):** DEV debe validar factibilidad y timeline con este alcance actualizado (Mercado Pago + exportación XML), no con el sizing original de la sección 6. **Superado por la actualización 2026-08-04 abajo.**

---

## Actualización 2026-08-04: la exportación XML vuelve al alcance de v1

**Quién decide:** Patricio, sobre recomendación de PRODUCT MANAGER (`docs/VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md`).

**Qué cambia:** el 2026-08-02 la exportación a `.bpmn` XML se movió a fase 2 post-MVP para no subir el sizing de v1. PRODUCT MANAGER analizó competencia directa (sección 3 de su documento) y encontró que **3 de 4-5 competidores directos ya exportan XML desde el día 1** ("Just Flow It", "BPMNify", "Patchley", "BA Copilot"), y que el precio de lanzamiento ya fijado (**CLP $9.990/mes**) no deja margen de diferenciación en "más barato, sin XML" frente a un competidor que cobra similar y sí tiene XML. Patricio aceptó la recomendación: **la exportación XML deja de ser post-MVP y pasa a ser requisito antes de abrir venta pública** — sigue siendo una fase separada en el plan de trabajo (no se funde con el motor prompt→JSON), pero entra dentro del alcance de v1, no después.

No cambia nada de lo ya construido: Fase 1 (Auth + persistencia) ya está migrada y no se toca. El research técnico de la Fase XML (`bpmn-moddle` + `bpmn-auto-layout`, ver Hallazgo 2 de `docs/VALIDACION-DEV-BPMN-DESDE-PROMPT.md`) sigue vigente sin rehacer.

### Orden de fases actualizado

| Fase | Contenido | Estado |
|---|---|---|
| 1. Auth + persistencia | Clonar patrón `sistemaaiprocess/src/auth.ts`, modelo Prisma, CRUD | ✅ Construida y migrada (schema `generador_bpmn` aislado) |
| 2. Motor prompt→JSON (Claude API) + render Mermaid en React | Prompt de sistema podado de `bpmn-architect`, JSON schema, port de `generarMermaid()` | ▶️ Arranca ahora |
| 3. Exportación `.bpmn` XML real | `bpmn-moddle` (árbol semántico) + `bpmn-auto-layout` (BPMNDI/layout automático), validación de apertura en Camunda Modeler / bpmn.io | 🆕 Vuelve al alcance de v1 (antes era fase 2 post-MVP) |
| 4. Editor post-generación | Port de la tabla de edición del prototipo a React | Sin cambios |
| 5. Suscripción de pago (Mercado Pago) | Checkout, webhook, estado de suscripción en BD, middleware de gating. Sin autogestión propia (cancelación manual vía dashboard, decisión 2026-08-02) | Sin cambios |
| 6. QA + SECURITY (Ley 19.628) + Delivery | Incluye de nuevo la superficie de exportación XML (auditoría de apertura correcta en herramientas externas), que había salido del alcance el 2026-08-02 | 🔁 Vuelve a incluir superficie XML |

### Nuevo T-shirt sizing total (cálculo explícito, no repetido de memoria)

Punto de partida: el sizing **ya validado por DEV el 2026-08-02** para v1 sin XML fue **20 días-persona**, sobre el alcance ya simplificado de Mercado Pago (Fase 5/Suscripción sin página de autogestión propia, 5 días-persona en vez de los 8 de la primera pasada con "portal" tipo Stripe). Ese recorte de autogestión **sigue vigente** — no se revierte con esta decisión, son dos cosas independientes.

Sobre esos 20 días-persona vigentes, vuelve a sumarse lo que se había sacado:

| Componente | Días-persona | Nota |
|---|---|---|
| v1 sin XML (ya validado por DEV, 2026-08-02, con Mercado Pago sin autogestión) | 20 | Auth(3) + Motor prompt→JSON(6) + Editor(2) + Suscripción(5) + QA/Security/Delivery(3) — sin superficie XML |
| + Exportación XML (Fase 3 nueva) | +6 | Cifra ya cuantificada por DEV en `VALIDACION-DEV-BPMN-DESDE-PROMPT.md` Hallazgo 2 (`bpmn-moddle` + `bpmn-auto-layout`, incluye el spike de validación de apertura) |
| + Ajuste de QA/Security/Delivery por volver a auditar superficie XML | +1 | Estimación propia (S → S+, el mismo delta que el documento de DEV ya había señalado al sacar XML el 2026-08-02, ahora en sentido inverso) — **DEV debe confirmar este número, no lo doy por cerrado** |
| **Total v1 con XML adentro** | **27 días-persona** | |

**27 días-persona ÷ 5 días laborables/semana = 5,4 semanas calendario**, a la misma dedicación de tiempo completo que ya confirmó DEV para el resto del proyecto.

**T-shirt size: L** (no M). Esto reabre el salto de tamaño que la propuesta original ya había anticipado en la pregunta pendiente #5 ("si exportación XML es requisito, sube el proyecto de M a L") — ahora se confirma, con el número real: **27, no los ~26-29 días-persona de la primera pasada de DEV**, porque la reducción de Mercado Pago (sin autogestión, -3 días) sigue vigente y compensa parte de lo que XML vuelve a sumar.

**Esto es un sizing de ARQUITECTO, no un compromiso de fecha.** Como en toda esta propuesta, el número que Patricio puede comprometer con el cliente/mercado necesita la validación de DEV — en particular el ajuste de +1 día en QA/Security que aquí es una estimación mía, no una cifra que DEV haya cuantificado todavía. **Siguiente paso: DEV valida este sizing de 27 días-persona / ~5,4-6 semanas (con buffer) antes de que se comprometa fecha con Patricio**, igual que validó el de 20 días-persona el 2026-08-02.

## Costo Estimado

- Herramientas: Stripe (sin costo fijo, % por transacción), Claude API (costo variable por uso, a definir con volumen esperado), infraestructura VPS ya pagada (sin costo incremental).
- Horas: a estimar por DEV una vez fijadas las preguntas pendientes (sección 5), especialmente #1 (límite de uso por plan, afecta diseño) y #5 (alcance de exportación, afecta tamaño de la Fase 2).
- Total: **dentro del umbral que no requiere escalación a Patricio por presupuesto** (<$5K en horas internas), sujeto a que las respuestas a las preguntas pendientes no amplíen el alcance (ej. exportación a `.bpmn` XML sí movería esto a L y ahí sí conviene una segunda validación de costo).

---

## Actualización 2026-08-04: Anthropic vs OpenAI para el motor de extracción prompt→JSON

**Por qué se revisa:** Patricio cuestionó que la sección 2 haya elegido la API de Claude solo por reutilización de stack ("ya se usa `@anthropic-ai/sdk` en `sistemaaiprocess`"), sin comparar costo/desempeño real para este caso de uso puntual. Corresponde comparar en serio antes de comprometerse.

**El caso de uso, leído del código real (`generador-bpmn/src/lib/extraccion-llm.ts`):** una sola llamada por diagrama (`client.messages.create`, sin loop de tool-use), `output_config.format` con JSON schema estricto (`additionalProperties: false`), prompt de sistema en español de ~600 palabras con reglas explícitas de negocio, extrayendo actores + pasos (con ids y referencias `siguiente*`) de una descripción libre del usuario. Es extracción estructurada de texto corto con reglas bien definidas — no hay razonamiento multi-paso, no hay tool-use, no hay agente. Esto importa para elegir modelo: es exactamente el perfil de tarea para el que existen los tiers "mini/haiku", no los tiers de razonamiento.

### 1. Tokens estimados por llamada

- **Entrada:** system prompt (~600 palabras en español) ≈ 800-1000 tokens + JSON schema de salida (cuenta como parte del procesamiento, se cachea 24h tras la primera compilación) + descripción del usuario (rango realista 200-1000 tokens para un proceso de negocio típico). Total de entrada: **~1200-2500 tokens** por llamada, tomo **~1500** como caso representativo.
- **Salida:** JSON con actores + N pasos (cada paso ~40-60 tokens: id, actor, lane, tipo, texto, 3 campos de destino). Para un proceso de 8-15 pasos: **~500-1500 tokens**, tomo **~1000** como caso representativo.

Esto confirma el rango que planteó PM (500-2000 en ambos sentidos) — no es una tarea de contexto largo.

### 2. Precios reales, consultados hoy (2026-08-04)

**Anthropic** (cacheado en la skill interna al 2026-06-24, vigente):

| Modelo | Input /MTok | Output /MTok |
|---|---|---|
| Claude Sonnet 5 (modelo actual en el código) | $3.00 ($2.00 intro hasta 2026-08-31) | $15.00 ($10.00 intro) |
| **Claude Haiku 4.5** | **$1.00** | **$5.00** |

**OpenAI** (consultado vía WebFetch a `developers.openai.com/api/docs/pricing`, hoy):

| Modelo | Input /MTok | Output /MTok |
|---|---|---|
| GPT-5 (flagship) | $1.25 | $10.00 |
| GPT-4o-mini | $0.15 | $0.60 |
| GPT-4.1-mini | $0.40 | $1.60 |
| **GPT-5-mini** | **$0.25** | **$2.00** |
| GPT-5-nano | $0.05 | $0.40 |

No cito precios de memoria en ningún caso — el número de OpenAI viene de la página oficial de pricing consultada en esta sesión, no de recuerdo de entrenamiento (que estaría desactualizado).

### 3. Costo real por llamada y a volumen (con los supuestos de la sección 1)

| Modelo | Costo/llamada (1500 in / 1000 out) | 1.000 diagramas/mes | 10.000 diagramas/mes |
|---|---|---|---|
| Claude Sonnet 5 (actual, sin cambiar) | ~$0.0195 (~$0.013 en precio intro) | ~$19.50 (~$13 intro) | ~$195 (~$130 intro) |
| **Claude Haiku 4.5** | **~$0.0065** | **~$6.50** | **~$65** |
| GPT-5-mini | ~$0.0024 | ~$2.40 | ~$24 |
| GPT-5-nano (no recomendado, ver abajo) | ~$0.0005 | ~$0.50 | ~$5 |

**Lectura:** el salto grande de costo ya estaba disponible *dentro* de Anthropic — pasar de Sonnet 5 a Haiku 4.5 es una reducción de ~3x y no requiere tocar el proveedor. El salto adicional de Haiku 4.5 a GPT-5-mini es real (~2.7x más barato) pero, en dólares absolutos a este volumen, es una diferencia de **~$40-60/mes a 10.000 diagramas/mes**, y de unos pocos dólares al mes al volumen de lanzamiento (cientos de diagramas). GPT-5-nano es más barato todavía, pero lo descarto para esta tarea: el schema exige que el modelo mantenga consistencia referencial entre `id`, `siguiente`, `siguienteSi`/`siguienteNo` y la lista de actores — es la parte de la tarea con más superficie de error, y un tier "nano" es el que más arriesga esa consistencia. No hay evidencia empírica propia de esto (no corrí un benchmark), lo marco como criterio de precaución, no como dato medido.

### 4. Modelo específico (no solo proveedor)

- **Dentro de Anthropic: Haiku 4.5, no Sonnet 5.** El código usaba Sonnet 5 — el modelo más capaz de la familia — para una tarea de extracción simple con schema estricto. Esto confirma el hallazgo previo de PM. Haiku 4.5 está explícitamente soportado para `output_config.format` (structured outputs), así que no hay pérdida de capacidad técnica al bajar de tier.
- **Dentro de OpenAI: GPT-5-mini, no GPT-4o-mini ni GPT-5-nano.** GPT-4o-mini es más caro que GPT-5-mini y de una familia anterior — no hay razón para preferirlo. GPT-5-nano es el más barato pero se descarta por el riesgo de consistencia referencial explicado arriba.

### 5. Calidad de structured output: ¿hay diferencia real?

No, para este caso de uso. Ambos proveedores resuelven JSON schema estricto de forma nativa y equivalente: Anthropic vía `output_config.format` (soportado en Haiku 4.5), OpenAI vía Structured Outputs con `strict: true` (soportado en toda la familia GPT-4o+/GPT-5, incluido GPT-5-mini). El "no vas a alucinar un campo faltante" es un problema resuelto en ambos lados — no es un diferenciador para decidir proveedor en esta tarea puntual. Sobre precisión de *contenido* (interpretar correctamente el texto en español y armar la lógica de branching), no tengo benchmark propio comparando ambos modelos en este dominio específico — lo señalo como supuesto no verificado, no como hecho.

### 6. Costo de cambiar de proveedor si se decidiera

Bajo. `extraccion-llm.ts` es la única superficie que toca el SDK de Anthropic en todo `generador-bpmn` — el resto de la app solo conoce la firma `extraerProcesoDesdePrompt(descripcion) → ResultadoExtraccion`, que es agnóstica de proveedor. Migrar a OpenAI sería: reescribir este archivo (cliente `openai`, `response_format`/`json_schema` con `strict: true` en vez de `output_config.format`, manejo de `refusal` distinto porque OpenAI no tiene un `stop_reason: "refusal"` equivalente), cambiar la variable de entorno y el `package.json`. No hay arquitectura que rehacer — es una capa aislada de un solo archivo, tal como preguntaba Patricio. Esto significa que la decisión de hoy **no es irreversible ni cara de revertir** si el volumen cambia el cálculo más adelante.

### 7. Reutilización de stack: sigue siendo un argumento válido, pero no decisivo por sí solo

`sistemaaiprocess` ya integra `@anthropic-ai/sdk` y ya existe el proceso de gestión de la llave (aunque hoy esté vacía en el VPS) — eso reduce fricción operativa real: una cuenta de facturación, una llave, un patrón de manejo de errores conocido por el equipo. Pero a la luz del cálculo de la sección 3, este argumento **no hace falta usarlo como decisivo**, porque el costo real tampoco favorece claramente a OpenAI a este volumen — la diferencia en dólares es menor que el costo operativo de mantener un segundo proveedor de LLM para un producto que recién arranca.

### Recomendación final

**Mantener Anthropic, no cambiar de proveedor. Cambiar el modelo de Claude Sonnet 5 a Claude Haiku 4.5** para esta tarea de extracción — ya aplicado en `extraccion-llm.ts` (`MODELO = "claude-haiku-4-5"`, línea única, verificado con `npx tsc --noEmit` sin errores).

**Motivo principal:** la comparación real de costo (sección 3) muestra que el ahorro de cambiar de proveedor (Haiku 4.5 → GPT-5-mini, ~$40-60/mes a 10.000 diagramas/mes) es menor que el costo operativo de administrar un segundo proveedor de LLM en una empresa de este tamaño ("mínimo costo PYME"), mientras que el ahorro de bajar de tier *dentro* de Anthropic (Sonnet 5 → Haiku 4.5, ~3x) es igual de grande y no cuesta nada operativamente. La reutilización de stack (sección 7) es un argumento de apoyo, no la razón principal — el cálculo de costo ya sostiene la decisión por sí solo a este volumen. Si el producto escala uno o dos órdenes de magnitud en volumen y GPT-5-mini sigue siendo 2-3x más barato en ese momento, vale la pena reabrir la pregunta — y el costo de hacerlo entonces es bajo, porque el motor de extracción sigue siendo una capa de un solo archivo (sección 6).
