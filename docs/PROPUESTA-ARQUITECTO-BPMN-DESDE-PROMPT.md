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
| Pagos/suscripción | **Stripe Billing** (Checkout + Customer Portal) | Ningún producto interno lo tiene todavía, así que no hay nada que reutilizar — pero Stripe Checkout es la opción de menor esfuerzo para "cobrar suscripción mensual" sin construir facturación propia. Alternativa evaluada y descartada: Mercado Pago (foco LATAM/Chile, pero su modelo de suscripciones recurrentes es más manual que Stripe Billing; se reconsidera solo si Stripe da fricción con medios de pago chilenos). |
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
| 5. Alcance de exportación v1 | ~~También exportar a `.bpmn` XML real~~ → **Revisado 2026-08-02 tras validación de DEV: v1 lanza solo con PNG/PDF.** DEV cuantificó el costo real (+6 días-persona, ~1.2 semanas, más el riesgo de una librería de adopción menor) y Patricio decidió mover la exportación XML a **fase 2 post-MVP**. La investigación técnica ya está hecha (`bpmn-moddle` + `bpmn-auto-layout` cubren el mapeo sin construir un layout engine propio) y documentada en `docs/VALIDACION-DEV-BPMN-DESDE-PROMPT.md` — no hay que rehacerla cuando se retome. |

**Siguiente paso:** DEV debe validar factibilidad y timeline con este alcance actualizado (Mercado Pago + exportación XML), no con el sizing original de la sección 6.

## Costo Estimado

- Herramientas: Stripe (sin costo fijo, % por transacción), Claude API (costo variable por uso, a definir con volumen esperado), infraestructura VPS ya pagada (sin costo incremental).
- Horas: a estimar por DEV una vez fijadas las preguntas pendientes (sección 5), especialmente #1 (límite de uso por plan, afecta diseño) y #5 (alcance de exportación, afecta tamaño de la Fase 2).
- Total: **dentro del umbral que no requiere escalación a Patricio por presupuesto** (<$5K en horas internas), sujeto a que las respuestas a las preguntas pendientes no amplíen el alcance (ej. exportación a `.bpmn` XML sí movería esto a L y ahí sí conviene una segunda validación de costo).
