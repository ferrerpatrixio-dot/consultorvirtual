# 📋 BITACORA DE CAMBIOS — CONSULTORAVIRTUAL

**Propósito:** Registro histórico de cambios estructurales, decisiones arquitectónicas, versiones.  
**Actualizado:** 2026-08-02  
**Responsable:** PMcoordinador (auditoría continua)

---

## 📅 CAMBIOS RECIENTES

### 2026-08-02 (continuación) — Reestructuración de agentes + arranque producto BPMN-desde-prompt (PMcoordinador)

**PRODUCTO NUEVO — Generador BPMN desde prompt (MVP Línea de Negocio 3):**
- ✅ Propuesta de arquitectura: `docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md`
- ✅ Decisiones de Patricio registradas en la propuesta: mono-usuario, Mercado Pago (no Stripe),
  exportación a `.bpmn` XML real (no solo PNG/PDF), precio a definir después con infraestructura
  de gating lista
- ⚠️ **Impacto de esas decisiones:** el tamaño sube de M a **L**. Mercado Pago tiene suscripción
  recurrente más manual que Stripe, y el XML BPMN 2.0 obliga a un mapeo que Mermaid solo no cubre.
  DEV debe re-validar el sizing con este alcance, no con el original.
- ✅ Se reutiliza `apps/generador-diagramas.html` (motor Mermaid + editor de pasos ya validado)

**REESTRUCTURACIÓN ORGANIZACIONAL (a pedido de Patricio):**
- ✅ **ARQUITECTO se dividió en dos roles** (eran dos expertises distintas en un solo agente):
  - `ARQUITECTO IT` — decide stack y herramientas (UI, motor, BBDD, backend)
  - `ANALISTA DE PROCESOS DE NEGOCIO` — mapa de procesos, procedimientos, reporte de riesgos y
    reporte de errores de proceso
- ✅ Creados como agentes invocables: `.claude/agents/arquitecto-it.md`, `analista-procesos-negocio.md`
- ✅ **Creados DEV y QA como agentes invocables** — existían en la matriz pero no en `.claude/agents/`,
  o sea no se podían llamar. Ahora sí.
- ✅ **Creado `organizacionvirtual/EQUIPO.md`** — roster completo: quién existe, cómo se invoca, en
  qué momento del flujo entra. Referenciado desde los 11 agentes para que se vean entre sí.
- ✅ Actualizado: MATRIZ_AGENTES v1.4, ORGANIGRAMA, `diseñador-ux.md` (ahora apunta a los dos roles nuevos)
- ℹ️ DISEÑADOR-UX **ya existía** desde 2026-07-31; no se creó de nuevo, solo se actualizaron sus referencias.

**Total agentes invocables:** 11 (`.claude/agents/`) + PMcoordinador (`.claude/CLAUDE.md`).

**DOSSIER DE DISEÑO DETALLADO — nuevo protocolo (a pedido de Patricio):**
- ✅ Creado `docs/SOP-DOSSIER-DISENO-DETALLADO.md` — documento único que se entrega al cliente al
  cierre de cada proyecto, consolidando el aporte de cada agente con **acción relevante**
- ✅ **PM compila:** identifica quién participó, solicita aportes con formato y deadline, resuelve
  contradicciones entre agentes, valida contra checklist. No escribe el contenido técnico.
- ✅ **QA aporta casos de uso + esperables documentados**, escritos en lenguaje de negocio para que
  los lea el cliente — son material base de la capacitación y de la sección funcional del dossier
- ✅ **DELIVERY entrega** el dossier en el handoff, complementado con documentación operativa
- ✅ Regla anti-burocracia: si un agente no participó, no hay sección suya — y el resumen ejecutivo
  declara por qué. Nada de secciones vacías rellenadas "por si acaso".
- ✅ Actualizados: `CLAUDE.md` (PM, sección 4), `qa.md` (entregables 5 y 6), `delivery.md`
  (responsabilidad 6), `EQUIPO.md` (fase 6 del flujo), MATRIZ_AGENTES v1.4
- 📁 Ubicación de dossiers: `docs/dossiers/[cliente]-[proyecto]/`

**CORRECCIÓN DE MODELOS (a pedido de Patricio, optimización de costo):**
- ⚠️ Hallazgo: los 11 agentes en `.claude/agents/` tenían `model: opus` hardcodeado, contradiciendo
  `ASIGNACION-MODELOS-PENSAMIENTO-AGENTES.md` (que ya recomendaba Sonnet/Haiku para varios)
- ✅ Corregidos a `sonnet`: dev, qa, diseñador-ux, comercial, financiero-contable
- ✅ Corregido a `haiku`: delivery
- ✅ Mantienen `opus`: arquitecto-it, analista-procesos-negocio, security, product-manager, legal
- ✅ Actualizada la matriz a v1.1 con los dos roles nuevos (ARQUITECTO IT / ANALISTA-PROCESOS)
- ℹ️ Lección: el modelo real de un subagente lo define su frontmatter, no la matriz de política ni
  el modelo de la sesión del PM — hay que tocar ambos lugares o la matriz queda de adorno

**VALIDACIÓN DEV — sizing confirmado en L (2026-08-02):**
- ✅ `docs/VALIDACION-DEV-BPMN-DESDE-PROMPT.md` — DEV confirma el alcance L: ~29 días-persona
  (~6 semanas dedicado), verificando el prototipo real antes de estimar
- 🔑 Hallazgo Mercado Pago: no tiene equivalente al Customer Portal de Stripe — cancelar/cambiar
  medio de pago exigía construir una página propia (mayor contribuyente al alza de la Fase 4)
- 🔑 Hallazgo BPMN XML: `bpmn-moddle` + `bpmn-auto-layout` (oficiales de bpmn.io) cubren el mapeo
  semántico y el layout automático — evita construir un layout engine propio
- ✅ **Decisiones de Patricio sobre las preguntas de DEV:**
  - Autogestión de suscripción: **gestión manual** por Patricio vía dashboard MP mientras es
    mono-usuario (no se construye autogestión propia en v1) — reduce la Fase 4
  - Exportación `.bpmn` XML: **confirmada firme para v1** pese al costo ya cuantificado
  - Semántica de error BPMN (`fin_error`): resuelto por PM sin escalar — endEvent simple en v1
  - Dedicación DEV: **tiempo completo hasta MVP**, prioridad sobre otras líneas salvo urgencia cliente
- ✅ DEV recalculó Fase 4 sin autogestión propia (8→5 días-persona). Total con XML incluido: 26 días-persona.

**SEGUNDA REVISIÓN — exportación XML movida a fase 2 (2026-08-02, mismo día):**
- ⚠️ Patricio reconsideró la pregunta #2 al ver el costo ya cuantificado (+6 días-persona, más
  riesgo de librería de adopción menor) y **decidió mover la exportación `.bpmn` XML a fase 2
  post-MVP**. v1 lanza solo con PNG/PDF (como el prototipo original).
- ✅ Actualizados con el número final: `docs/VALIDACION-DEV-BPMN-DESDE-PROMPT.md` (Fase 5 marcada
  "movida a fase 2 — no entra en v1", riesgo 3 marcado no aplicable a v1, pregunta 2 con historial
  de la revisión), `docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md` (pregunta 5 tachada y corregida)
- 📌 **TOTAL FINAL v1: 20 días-persona ≈ 4 semanas calendario (dedicación tiempo completo).
  Compromiso recomendado con Patricio: 4.5–5 semanas** (buffer por el spike de Mercado Pago,
  única pieza sin precedente que queda en el alcance de v1)
- 📌 Fase 2 post-MVP ya dimensionada y lista para retomar sin re-investigar: exportación XML,
  +6 días-persona (~1.2 semanas), research ya hecho (`bpmn-moddle` + `bpmn-auto-layout`)

**Próximo paso:** DEV inicia con el spike de Mercado Pago (1 día) antes de comprometer fecha en firme.

---

### 2026-08-04 — Fase 1 implementada: Auth + persistencia (DEV)

**Construido en `generador-bpmn/`** (nueva carpeta, sibling de `sistemaaiprocess/`):
- Scaffold Next.js clonando convenciones exactas de `sistemaaiprocess` (mismas versiones de dependencias, mismo patrón de `auth.ts`)
- Prisma: modelos Auth.js estándar + `Diagram` (cliente, proceso, actores JSON, pasos JSON) — mono-usuario
- CRUD de diagramas protegido por sesión: `/dashboard`, `/diagramas/nuevo`, `/diagramas/[id]`
- Verificado antes de reportar: `npm install`, `prisma generate`, `tsc --noEmit`, `next build`, `eslint` — todo limpio
- Sin tocar `sistemaaiprocess/` ni hacer commit (según lo pedido)

**Decisión de infraestructura (Patricio, 2026-08-04):** OAuth de Google y proyecto Supabase
**compartidos** con `sistemaaiprocess` (no se crean cuentas nuevas — menor costo y setup).

**Corrección técnica aplicada (PM detectó antes de cerrar la fase):** `sistemaaiprocess` usa el
schema `public` de Postgres por defecto con tablas `User`/`Account`/`Session`/`VerificationToken`.
Compartir el mismo proyecto Supabase sin aislar `generador-bpmn` en su propio schema Postgres
hubiera chocado con esas tablas (falla de migración en el mejor caso, corrupción de datos entre
productos en el peor). Se pidió a DEV mover `generador-bpmn` a un schema Postgres separado
(`generador_bpmn`) dentro del mismo proyecto Supabase, vía `multiSchema` de Prisma — mismo
proyecto/billing, cero colisión de tablas. Confirmación pendiente de DEV.

**Próximo paso:** confirmar corrección de schema Postgres, luego arranca Fase 2 (motor prompt→JSON).

**Corrección confirmada (2026-08-04):** DEV validó en seco (`prisma validate`, `prisma migrate diff
--from-empty`) que el schema `generador_bpmn` queda completamente aislado de `public` — cero
referencias cruzadas con `sistemaaiprocess`. `sistemaaiprocess/` sigue sin ningún cambio. **Fase 1
cerrada.**

---

### 2026-08-04 — Viabilidad comercial (PRODUCT MANAGER)

**Reporte completo:** `docs/VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md`

- **Recomendación:** Aceptar con condiciones (no rechazo, no aceptación simple)
- 🔴 **Hallazgo crítico:** ya existen 4-5 competidores directos haciendo "prompt → BPMN" (Just Flow
  It, BPMNify, Patchley, BA Copilot), y **3 de ellos ya exportan a `.bpmn` XML real** — justo lo que
  se movió a fase 2 el mismo día. No es un mercado vacío. PRODUCT MANAGER recomienda priorizar la
  exportación XML como **primer ítem de fase 2**, no uno más de la lista — **pendiente de decisión
  de Patricio, no se re-prioriza sin su visto bueno** (afecta timeline ya comunicado)
- 💰 **Precio propuesto:** CLP $9.990/mes, plan único sin trial — **pendiente de confirmación de
  Patricio** (decisión de precio/modelo de negocio, Nivel 3 según MATRIZ_AGENTES)
- 👤 **Comprador real:** no es el analista individual genérico (una PYME chilena tiene gasto tech
  tope ≤1 UF/mes decidido por el dueño, no por un empleado). Comprador viable: consultores
  independientes, analistas con gasto vía tarjeta corporativa, o cartera propia de clientes de
  CONSULTORAVIRTUAL — cambia el mensaje de GTM, no el diseño técnico (mono-usuario sigue correcto)
- ⏳ Extendido para cubrir cobertura de pago por país LATAM y GTM de entrada a México (pedido de
  Patricio el mismo día) — pendiente de respuesta

---

### 2026-08-04 (cont.) — Migración de schema confirmada; corrección de infraestructura; PRODUCT MANAGER valida pricing

**Corrección de dato:** la base compartida con `sistemaaiprocess` **no es Supabase** — es Postgres
self-hosted en el VPS Hostinger de Patricio, vía EasyPanel (host interno
`iaprocess_server1_bbdd_postgres`, host externo real `2.24.87.198:5432`, base
`iaprocess_server1`). `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` existen en el `.env.local` de
`sistemaaiprocess` pero para otro propósito (no es la base de Auth/Prisma). Corregir
cualquier referencia previa a "proyecto Supabase compartido" — es la misma base EasyPanel.

**Migración `generador_bpmn` ejecutada y verificada dos veces** (DEV + PMcoordinador,
consulta directa a `information_schema.tables`):
- `public` (sistemaaiprocess): 9 tablas, sin cambios (Budget, Content, Decision, Metric,
  Phase, PhaseTask, Project, Script, User).
- `generador_bpmn`: 6 tablas nuevas (Account, Diagram, Session, User, VerificationToken,
  `_prisma_migrations`), aisladas como se diseñó.
- `prisma migrate dev` estándar falló (P3005, "schema not empty" — Prisma bloquea init en
  bases con tablas preexistentes en cualquier schema). Workaround usado: `prisma migrate
  diff --from-empty` → `prisma db execute` → `prisma migrate resolve --applied`, con el
  schema por defecto fijado en la URL (`?schema=generador_bpmn`) para evitar que
  `_prisma_migrations` quedara mal ubicado (error propio de DEV, detectado y corregido en
  el mismo intento).
- `generador-bpmn/.env.local` creado con `DATABASE_URL` real, `AUTH_GOOGLE_ID`/`SECRET`
  (compartidos, mismo Google OAuth app que sistemaaiprocess) y `AUTH_SECRET` **propio**
  (no reutiliza el de sistemaaiprocess — productos sin relación no deben compartir secreto
  de firma de sesión).
- `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` en `sistemaaiprocess/.env.local` son placeholders,
  no credenciales reales — login con Google no probado en local todavía en ninguno de los
  dos productos.
- Hallazgo de seguridad (no bloqueante, para SECURITY): la URL de conexión usa
  `sslmode=disable` sobre IP pública — tráfico Postgres sin cifrar por internet.

**Decisión validada por Patricio (opción A):** aceptar recomendación de PRODUCT MANAGER
(`docs/VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md`) — adelantar exportación XML como
prioridad de Fase 2 (en vez de dejarla para después), precio de lanzamiento **CLP
$9.990/mes**, plan único, sin trial en v1.

**Próximo paso:** Fase 1 cerrada. Arranca Fase 2 con exportación XML incluida desde el
inicio (no pospuesta) — encargar a ARQUITECTO IT/DEV el motor prompt→JSON→XML.

---

### 2026-08-04 (cont. 2) — DEV valida sizing final v1 con exportación XML (27 días-persona)

**Contexto:** ARQUITECTO IT actualizó `docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md`
("Actualización 2026-08-04") tras la decisión de Patricio de adelantar la exportación
`.bpmn` XML a v1 (antes fase 2 post-MVP), tomada sobre recomendación de PRODUCT MANAGER
por presión competitiva (3 de 4-5 competidores directos ya exportan XML) y con el precio
de lanzamiento ya fijado (CLP $9.990/mes). ARQUITECTO IT propuso **27 días-persona (L)**:
20 (v1 sin XML, ya validado por DEV el 2026-08-02) + 6 (exportación XML, cifra ya
cuantificada por DEV en `docs/VALIDACION-DEV-BPMN-DESDE-PROMPT.md`) + 1 (ajuste de
QA/Security para re-auditar la superficie XML, estimado por ARQUITECTO IT, marcado
explícitamente como pendiente de confirmación de DEV).

**Validación de DEV:**
- Los 20 + 6 = 26 días-persona ya estaban cuantificados por mí mismo en rondas anteriores;
  no hay nada que corregir ahí — la aritmética y el research (`bpmn-moddle` +
  `bpmn-auto-layout`, spike de medio día de apertura en Camunda Modeler/bpmn.io) siguen
  vigentes sin rehacer.
- El **+1 día de QA/Security es razonable, no insuficiente ni innecesario**, con el alcance
  acotado a: (a) revisión de seguridad de la serialización XML — confirmar que
  `bpmn-moddle` escapa correctamente texto de usuario (actores/pasos vienen de extracción
  LLM sobre prompt libre) y descartar la alternativa de "templating de string directo" que
  el propio Hallazgo 2 mencionaba como posible, porque ahí sí habría riesgo real de
  inyección XML si no se sanitiza a mano; (b) matriz de casos de prueba (decisiones, loops,
  actores con tildes/ñ/comillas, diagrama vacío/mínimo); (c) verificación independiente de
  apertura en herramientas externas, redundante pero deliberada respecto del spike de DEV.
  El chequeo funcional de apertura ya lo cubre DEV en sus propios 6 días, así que el día de
  QA/Security se concentra en seguridad + regresión, alcance realista para 1 día-persona.
- No corrijo el número de ARQUITECTO IT: **27 días-persona (L) queda validado tal cual.**
- Confirmo también que la Fase 3 (XML) sigue siendo una fase separada de la Fase 2 (motor
  prompt→JSON), no fusionada — para no perder trazabilidad de estimación entre ambas.

**Compromiso de timeline recomendado para Patricio:**
27 días-persona ÷ 5 días laborables/semana = **5,4 semanas calendario**, a tiempo completo
(dedicación ya confirmada el 2026-08-02, sin dilución entre líneas). Igual que en la
validación anterior, agrego buffer porque persisten dos riesgos de baja precedencia interna
sin resolver: el spike de Mercado Pago (Fase 5, ya señalado 2026-08-02) y, ahora también,
que `bpmn-auto-layout` es una librería de adopción menor cuyo comportamiento en producción
aún no se probó. **Recomendación de compromiso: 5,4–6 semanas calendario** (no redondear a
la baja). Si ambos spikes (Mercado Pago + apertura XML) salen limpios, 5,4 semanas es
alcanzable; si hay fricción en cualquiera de los dos, el buffer de hasta 6 semanas la
absorbe sin tener que renegociar fecha con Patricio a mitad de proyecto.

**Próximo paso:** con el sizing y timeline validados, arranca Fase 2 (motor prompt→JSON),
que era el estado ya vigente antes de esta actualización — esta validación no cambia el
orden de trabajo, solo confirma el número que PM puede comprometer con Patricio.

---

### 2026-08-04 (cont. 3) — Fase 2 implementada y probada end-to-end: motor prompt→JSON (DEV + ARQUITECTO IT)

**Construido por DEV** en `generador-bpmn/`: `src/lib/extraccion-llm.ts` (llamada a Claude API
con `output_config.format`/JSON schema estricto, prompt de sistema en español podado de
`bpmn-architect`, saneo defensivo de referencias `siguiente*` rotas), `src/lib/mermaid-render.ts`
(port literal de `generarMermaid()` del prototipo), flujo de UI en `diagramas/nuevo-ia/` +
preview en `diagramas/[id]/DiagramaPreview.tsx`, banner de `pending_questions` (viaja por query
string del redirect, no persiste — decisión de v1 marcada para revisión de ARQUITECTO IT si
importa más adelante). `prisma generate`/`tsc`/`eslint`/`build` limpios, verificado también por
PM de forma independiente.

**Cuestionamiento de Patricio:** por qué se necesita una `ANTHROPIC_API_KEY` separada en vez de
reusar su sesión pagada de Claude.ai/Claude Code, y por qué no OpenAI. Aclarado: la sesión de
chat es un producto distinto de la API de desarrollador (`console.anthropic.com`), sin acceso
programático para un backend multi-tenant. Sobre proveedor, se encargó a ARQUITECTO IT una
comparación real (no solo reutilización de stack).

**ARQUITECTO IT (comparación Anthropic vs OpenAI, sección nueva en
`docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md`):** se mantiene Anthropic — la diferencia de
costo real entre proveedores (~$40-60/mes a 10.000 diagramas/mes) no compensa operar un segundo
proveedor de LLM. Hallazgo real: el código usaba **Claude Sonnet 5** (el más caro/capaz) para
una extracción simple — se bajó a **Claude Haiku 4.5** (~3x más barato, mismo soporte de
structured outputs), cambio de una línea ya aplicado y verificado con `tsc`. Precios citados con
fuente (WebFetch a pricing oficial), no de memoria.

**Verificación end-to-end (PM, con key real provista por Patricio):** probado
`extraerProcesoDesdePrompt()` contra la API real con un ejemplo ("aprobación de vacaciones",
3 actores, decisión con dos ramas) — devolvió el JSON correcto: actores bien asignados, `id`/
`siguiente*` consistentes, `fin_ok`/`fin_error` bien cerrados, sin `pending_questions` (el
ejemplo no tenía ambigüedad). Key cargada en `generador-bpmn/.env.local` únicamente (no se tocó
`sistemaaiprocess`). Script de prueba temporal eliminado después de verificar.

**Fase 2 cerrada y commiteada/subida** (`247bf0a`, push a
`github.com/ferrerpatrixio-dot/consultorvirtual` — repo nuevo, sin remoto hasta hoy, ver
más abajo).

---

### 2026-08-04 (cont. 4) — Repo CONSULTORAVIRTUAL conectado a GitHub; Fase 3 implementada (exportación XML)

**Remoto nuevo:** el repo raíz `CONSULTORAVIRTUAL` (donde vive `generador-bpmn/`, `docs/`,
`organizacionvirtual/`) nunca había tenido remoto en GitHub — `sistemaaiprocess/` es un repo
git anidado y separado, con su propio origin (`APP-PROCESOS`), y eso confundía la referencia.
Patricio creó `github.com/ferrerpatrixio-dot/consultorvirtual` (vacío) y PM configuró el
remoto + subió los 71 commits de historial existente. `git push` sigue siendo intermitente en
esta máquina (a veces cuelga, a veces corre limpio en <30s) — no es un problema del repo, hay
que reintentar si se cuelga.

**PM decidió el orden de la Fase 3** (Patricio delegó explícitamente: "decide tú"): exportación
XML antes que editor post-generación, porque (a) ya estaba secuenciado así por ARQUITECTO IT el
mismo día, con el sizing de 27 días-persona validado sobre ese orden, y (b) el editor
post-generación ya está prácticamente cubierto — la tabla de edición de Fase 1 se reutiliza en
Fase 2 como red de seguridad tras la generación por IA.

**Construido por DEV — Fase 3, exportación `.bpmn` XML:**
- `src/lib/exportar-bpmn.ts`: árbol BPMN 2.0 con `bpmn-moddle` (actores→`Lane` dentro de un
  único `Process`, no pools separados — evita la limitación de `bpmn-auto-layout` con múltiples
  `participant`), tipos de paso mapeados a `StartEvent`/`UserTask`/`ServiceTask`/
  `ExclusiveGateway`/`EndEvent` simple (sin `errorEventDefinition`, respeta decisión previa),
  layout calculado con `bpmn-auto-layout`.
- `src/app/api/diagramas/[id]/exportar/route.ts`: descarga protegida por sesión + ownership.
- Botón "Exportar XML (.bpmn)" en `diagramas/[id]/page.tsx`.
- `bpmn-moddle` + `bpmn-auto-layout` agregadas como dependencias reales (no dev).
- `tsc`/`eslint`/`build` limpios — verificado por DEV y de nuevo por PM de forma independiente.

**Hallazgo verificado por PM (no solo reportado por DEV, confirmado con un script propio):**
`bpmn-auto-layout` v1.3.0 (última estable) **no calcula caja visual para `bpmn:Lane`** — el XML
generado tiene la semántica de carril correcta (`laneSet`/`flowNodeRef` bien asignados, PM lo
confirmó inspeccionando el XML de un ejemplo real: 3 actores, 7 nodos, 6 conexiones, 0 shapes de
Lane), pero al abrir el archivo en Camunda Modeler o bpmn.io **no se ven los recuadros
divisorios de carril**, solo los nodos sueltos. Causa raíz: el algoritmo de layout posiciona por
profundidad del grafo, ignorando el actor — DEV intentó reconstruir las cajas calculando
bounding-box por lane después del layout y no funciona porque los rangos de posición se
solapan entre actores.

**Decisión de Patricio:** lanzar v1 así, sin carriles visuales en el XML exportado (el dato
sigue siendo correcto, la limitación es solo estética/de layout automático), sin invertir
tiempo extra no incluido en el sizing de 27 días. Limitación documentada en comentarios de
`exportar-bpmn.ts` para quien la retome.

**Fase 3 cerrada y subida** (`4391a8e`, push manual de Patricio tras colgarse el automático —
mismo gotcha de Git Credential Manager, ver entradas anteriores).

---

### 2026-08-04 (cont. 5) — Confirmado: Mercado Pago sirve para México; secuencia GTM se mantiene Chile→México

**Contexto:** Patricio preguntó si conviene usar Mercado Pago "porque quiero enfocar la
promoción" en México, dando a entender que el foco de lanzamiento podría moverse ahí. Antes
de tocar nada, PM revisó lo que PRODUCT MANAGER ya había investigado (sección 7 de
`docs/VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md`, escrita antes en el mismo día) en vez
de re-investigar, y verificó con WebSearch propio que Mercado Pago México tiene API de
"Planes de suscripción" (`mercadopago.com.mx/developers`) — confirma lo que el análisis
interno ya decía.

**Hallazgos ya documentados (no nuevos, solo repasados):**
- México: cobertura fuerte (tarjetas, SPEI, OXXO), pero **OXXO es efectivo diferido — no sirve
  para cobro recurrente automático**, igual que el resto de la región, depende de tarjeta
  tokenizada.
- Chile: cobertura funciona, pero **Webpay (Transbank) no está integrado al checkout de
  Mercado Pago** — riesgo de percepción de confianza (no técnico), mitigable con copy, no con
  desarrollo. No reabre la decisión de proveedor.
- **Bloqueador legal sin resolver, pendiente de ARQUITECTO IT:** una cuenta de Mercado Pago
  está atada a un país (`site_id` distinto por país — MLC/MLM/MLA/etc.). No está confirmado si
  CONSULTORAVIRTUAL (entidad chilena) puede abrir cuenta vendedora en México sin RFC/entidad
  legal local. Si exige constituirse allá, expandir a México deja de ser un cambio de
  configuración y pasa a ser decisión de LEGAL/inversión. **No bloquea el lanzamiento en
  Chile**, solo la expansión futura.

**Decisión de Patricio (confirmada explícitamente, resolviendo la tensión con su pregunta
inicial):** se mantiene la secuencia recomendada por PRODUCT MANAGER — **Chile primero,
México es expansión posterior**, no lanzamiento simultáneo. La pregunta sobre Mercado Pago
era sobre el proveedor de pago (confirmado: sirve para ambos países cuando corresponda), no
un cambio de en qué país se lanza primero.

**Documentación corregida:** `docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md` sección 2
("Decisión de stack") todavía decía Stripe Billing pese a que la decisión real desde
2026-08-02 era Mercado Pago (solo la sección de preguntas resueltas lo tenía correcto) — PM
lo corrigió para que quien lea la propuesta desde el inicio no vea una contradicción.

**Próximo paso:** con la secuencia confirmada, sigue el plan ya trazado para Chile — Fase 4
(editor, prácticamente ya cubierto por la tabla de edición reutilizada) o Fase 5 (spike de
Mercado Pago de 1 día, recomendado por DEV antes de comprometer sizing en firme de la
suscripción). El bloqueador legal de México queda anotado para cuando se evalúe esa
expansión, no para ahora.

---

### 2026-08-04 (cont. 6) — Requisito Mercado Pago Chile: no exige empresa constituida

**Pregunta de Patricio:** hoy solo emite boleta de honorarios (persona natural), sin empresa
formada — ¿eso bloquea abrir cuenta vendedor de Mercado Pago?

**Respuesta (PM, vía WebSearch, no pudo leerse la página oficial directo — 403/anti-bot):**
No bloquea. Mercado Pago Chile ofrece cuenta vendedor como **"persona natural con giro"**
(alternativa a "sociedad comercial"), con el RUT personal. El requisito de fondo es tener
**"inicio de actividades" en el SII**, que emitir boleta de honorarios ya exige (segunda
categoría) — Patricio ya lo cumple sin acción adicional. **Pendiente de verificación directa
por Patricio** en `mercadopago.cl/hub/registration` antes de que DEV arranque el spike, porque
la fuente no fue la página oficial de Mercado Pago (bloqueada), sino fuentes secundarias
cruzadas con la normativa SII.

**Próximo paso (decidido por Patricio):** Fase 4, editor post-generación.

---

### 2026-08-04 (cont. 7) — Fase 4 verificada: editor post-generación ya estaba completo

DEV revisó el flujo completo (generar con IA → editar actores/pasos/ramas → re-render
Mermaid → export XML) contra la propuesta original — **no encontró gaps reales, cero cambios
de código.** La tabla de edición de Fase 1 (agregar/editar/eliminar actores y pasos, corregir
`siguiente*` mal inferidos) ya servía como editor post-generación, con `revalidatePath`
propagando cualquier edición al preview Mermaid y a la exportación XML. Única diferencia vs.
el prototipo (edición fila-por-fila con `onChange` inmediato → patrón "Editar → Guardar" de
server actions) es una adaptación de framework, no una pérdida funcional. `tsc`/`eslint`/
`build` limpios, verificado por PM que no quedó nada sin commitear (no había cambios).

**Fase 4 cerrada, sin commit necesario.** v1 completo salvo Fase 5 (suscripción Mercado Pago)
y Fase 6 (QA/Security/Delivery). Próximo paso: spike de Mercado Pago (1 día, ya recomendado),
pendiente de que Patricio confirme el registro de cuenta vendedor persona natural en
`mercadopago.cl/hub/registration`.

---

### 2026-08-04 (cont. 8) — Spike Mercado Pago: sizing de Fase 5 sube de 5 a ~6.5-7 días-persona

Patricio decidió la variante técnica: **"Suscripciones con plan asociado"** (`POST
/preapproval_plan` una vez + `POST /preapproval` por cliente), pasando la documentación
oficial completa. DEV corrió el spike de investigación (documento completo en
`docs/SPIKE-MERCADO-PAGO-BPMN-DESDE-PROMPT.md`):

**Confirmado por documentación oficial:**
- Tokenización client-side: **MercadoPago.js V2 + `CardForm`** (`@mercadopago/sdk-js`) — no
  hay checkout hosteado para este flujo, hay que construir un formulario de tarjeta propio.
  Dato del token nunca toca nuestro servidor (acota alcance PCI), pero DEV sí mantiene esa UI.
- Webhooks: **tres tópicos**, no uno — `subscription_preapproval` (alta/estado),
  `subscription_authorized_payment` (cobros), `payments` (detalle, recomendado).
- CLP: entero sin decimales (`9990`, no `9990.00`) — **inferido, no verificado con la API
  real** (el ejemplo oficial que DEV pudo leer usaba ARS con decimales).

**No pudo probar contra sandbox real — correctamente, no lo simuló.** Crear la app +
cuentas de prueba en Mercado Pago Developers exige loguearse con la cuenta real de Patricio o
crear una cuenta — acciones que DEV/PM tienen prohibido ejecutar aunque se autoricen. Patricio
compartió después la guía de "Cuentas de prueba" (Vendedor+Comprador, mismo país, hasta 15,
con tarjetas de prueba) — PM se la reenvió al agente en curso, pero no cambia el bloqueo de
fondo: alguien tiene que crear la cuenta con su login real primero.

**Sizing actualizado:** Fase 5 sube de 5 a **~6.5–7 días-persona** — el hallazgo nuevo es el
formulario de tarjeta propio (2 días, no dimensionado antes porque no estaba confirmado que
faltara checkout hosteado) más el segundo tópico de webhook (+0.5 día). **Total v1: ~21.5–22
días-persona** (antes 20), sigue dentro del buffer de 4.5–5 semanas ya comprometido con
Patricio — no hace falta renegociar el timeline.

**Para destrabar la validación práctica (formato CLP con dato real, no inferido):** Patricio
crea una aplicación en `mercadopago.cl/developers`, genera cuenta de prueba Vendedor Chile +
Comprador Chile, y pasa el Public Key + Access Token de prueba (`TEST-...`) de la cuenta
Vendedor.

---

### 2026-08-04 (cont. 9) — Guía de referencia Mercado Pago creada; evaluación Bricks vs CardForm

Patricio pidió consolidar toda la documentación de Mercado Pago pegada durante la sesión en un
doc reusable para futuros proyectos. Creado `docs/referencia/MERCADO-PAGO.md` (guía técnica
general: dos formas de cobro, tokenización, sandbox, webhooks, moneda, cobertura LATAM,
requisitos legales) + pointer agregado en `.claude/agents/arquitecto-it.md` + memoria personal
de PM (`referencia-mercado-pago.md`) para que quede disponible entre proyectos, no solo en este
repo.

**ARQUITECTO IT evaluó si Checkout Bricks bajaba el sizing** (Patricio preguntó tras pasar la
tabla de tipos de integración): **no hay confirmación oficial** de que el token del Card
Payment Brick sirva para `/preapproval` — ningún ejemplo oficial de suscripciones usa Bricks,
todos usan CardForm. Se mantiene CardForm, sizing sin cambios (~6.5–7 días-persona). Detalle en
`docs/SPIKE-MERCADO-PAGO-BPMN-DESDE-PROMPT.md` sección 5.

**Confirmado oficialmente (documentación de Core Methods móvil, tabla de parámetros):** CLP va
sin decimales — ya no es inferencia, es una línea explícita de Mercado Pago.

---

### 2026-08-04 (cont. 10) — Validación real contra sandbox: CLP confirmado con dato real, `/preapproval` bloqueado por particularidad de testing

Patricio consiguió credenciales de prueba (`TEST-...` Public Key + Access Token, cuenta
Vendedor Chile) y PM las cargó en `generador-bpmn/.env.local` (fuera de git). DEV cerró la
mitad práctica del spike vía `curl`, sin dejar scripts en el repo:

- **`POST /preapproval_plan`: éxito (`201`).** `transaction_amount: 9990` para `CLP` aceptado
  sin error — **confirma con dato real**, no solo documentación, que CLP va entero. Hallazgo
  menor: `back_url` es obligatorio (devuelve `400` sin él).
- **`POST /v1/card_tokens`: éxito (`201`, x2).** Tarjeta de prueba oficial vigente (Mastercard
  `5416 7526 0258 2580`, titular `APRO` = escenario aprobado). **Hallazgo real:**
  `identification.type` debe ser `"RUT"` para Chile, no `"OTHE"` como sugería la tabla de
  tarjetas — `"OTHE"` es rechazado con `400`.
- **`POST /preapproval`: bloqueado (`404 "Card token service not found"`), causa no es un bug
  nuestro.** Confirmado en el centro de ayuda oficial: las credenciales `TEST-...` de un solo
  nivel no alcanzan para este endpoint específico — Mercado Pago exige loguearse *dentro* de la
  cuenta de prueba Vendedor y crear ahí una segunda aplicación anidada, usando ese segundo par
  de credenciales. Es login humano, mismo límite ya documentado (un agente no puede ejecutarlo).
  **Esto es una particularidad exclusiva del entorno de pruebas — en producción no existe el
  anidamiento**, no proyecta riesgo sobre la Fase 5 real.

**Spike de Mercado Pago cerrado.** Lo único pendiente para ver un `/preapproval` exitoso en
sandbox (no bloqueante para empezar a codear) es que Patricio haga el login anidado si quiere
una demo antes de producción. `docs/SPIKE-MERCADO-PAGO-BPMN-DESDE-PROMPT.md` sección 6 tiene el
detalle completo. **Próximo paso:** arrancar implementación real de la Fase 5.

---

### 2026-08-04 (cont. 11) — Fase 5 implementada: suscripción Mercado Pago real (DEV)

**Prisma:** `User` suma `subscriptionStatus` (espeja el `status` de Mercado Pago:
pending/authorized/paused/cancelled) y `mercadopagoPreapprovalId`. Migrada contra la base real
con `prisma migrate deploy` (no `migrate dev` — el shell no interactivo lo rechaza; DEV escribió
el SQL a mano igual a lo que Prisma habría generado). **Verificado por PM de forma
independiente** (tercera vez, mismo método): `public` sigue con sus 9 tablas exactas,
`generador_bpmn` sin tablas nuevas, solo las dos columnas agregadas a `User`. Aislamiento
intacto.

**Bootstrap del plan:** `scripts/bootstrap-mercadopago-plan.mjs`, corrido de verdad contra las
credenciales de prueba — `preapproval_plan_id` real creado y guardado en `.env.local`.
**Hallazgo nuevo, no estaba en el spike:** `back_url` debe ser **https** — `http://localhost`
es rechazado (`400`). Se agregó `MERCADOPAGO_BACK_URL` como variable propia con un placeholder,
a reemplazar cuando haya dominio real.

**Flujo de alta:** página `/suscripcion` (fuera del grupo de rutas protegidas, a propósito —
un usuario sin suscripción tiene que poder llegar ahí) con CardForm → server action →
`POST /preapproval` → actualiza `User`.

**Webhook:** `/api/webhooks/mercadopago` maneja los tres tópicos, resolviendo todo contra
`mercadopagoPreapprovalId` (no `external_reference`, que no llega en el payload del webhook).
**Dos gaps marcados explícitamente por DEV, no escondidos:** el endpoint
`GET /authorized_payments/{id}` para el tópico de cobros no está confirmado en ninguna
documentación que se le haya dado — queda comentado en el código como pendiente de validar
contra un payload real. Y **no hay verificación de firma del webhook todavía**
(`MERCADOPAGO_WEBHOOK_SECRET` sin configurar) — gap de seguridad real, aceptable mientras los
webhooks no estén activados de verdad en el panel de Mercado Pago, pero **bloqueante antes de
producción**.

**Gating:** `requireActiveSubscription()` en `src/lib/session.ts`, aplicado en
`(app)/layout.tsx` (`/dashboard` + `/diagramas/*`).

**Gap encontrado por DEV y corregido por PM antes de commitear:** el endpoint de exportación
XML (`/api/diagramas/[id]/exportar`, Fase 3) solo estaba protegido por `requireUser` — quedaba
fuera del scope que se le dio a DEV (`/dashboard` + `/diagramas/*` como página, no como ruta de
API), así que un suscriptor vencido podía seguir exportando diagramas ya creados. PM lo cambió a
`requireActiveSubscription` (una línea) y reverificó `tsc`/`eslint`/`build` — limpio, con las 9
rutas esperadas incluyendo `/suscripcion` y `/api/webhooks/mercadopago`.

**No se usaron credenciales de producción** (`APP_USR-...`, que Patricio compartió por error en
el chat el mismo día — ver nota de seguridad en el mensaje de esa ronda) en ningún momento de
esta implementación, solo las de prueba (`TEST-...`).

**Fase 5 cerrada en código, con dos gaps explícitos pendientes antes de producción:**
verificación de firma de webhook, y confirmar el endpoint de cobros contra un payload real
(requiere activar webhooks de verdad en el panel, con dominio público — no se puede probar en
`localhost`). Sin commitear todavía. **Próximo paso:** Fase 6 (QA + Security + Delivery) o
cerrar los dos gaps de producción antes, a decidir con Patricio.

---

### 2026-08-04 (cont. 12) — SECURITY audita Fase 5: paywall evadible vía Server Actions (crítico, corregido)

**Arranca Fase 6.** SECURITY auditó todo el código de pagos (`docs/AUDITORIA-SECURITY-FASE5-MERCADOPAGO.md`, reporte completo). Hallazgo propio, no reportado antes por DEV:

**🔴 Crítico, bloqueaba producción con cobro real:** las 9 funciones de
`src/app/(app)/actions.ts` (crear/editar/borrar diagramas, generación por IA) llamaban a
`requireUser()` en vez de `requireActiveSubscription()`. El gating de Fase 5 solo protegía el
*render* de las páginas vía `layout.tsx` — pero en Next.js los Server Actions son endpoints
HTTP públicos independientes que no pasan por ese layout. Cualquier usuario logueado sin pagar
(o con suscripción cancelada) podía usar el producto completo gratis, **incluida la generación
por IA, que consume Claude API con costo real por llamada**. Confirmado contra la guía oficial
de seguridad de Next.js. **PM corrigió las 9 llamadas** (`requireUser` →
`requireActiveSubscription`), reverificó `tsc`/`eslint`/`build` — limpio.

**Los dos gaps de DEV, reevaluados por SECURITY:**
- **Firma de webhook (🟠 alto, no bloqueante):** confirmado que sigue sin implementarse, pero
  el impacto real es acotado — el código nunca confía en el payload del webhook, siempre
  re-consulta el estado real a Mercado Pago antes de escribir en la base. No permite forjar una
  suscripción falsa hoy. Igual debe cerrarse antes de escalar tráfico (defensa en profundidad).
- **`GET /authorized_payments/{id}`:** confirmado como endpoint oficial documentado — la
  incertidumbre de DEV queda resuelta, no era un gap real.

**Verificado sin hallazgos:** PCI (CardForm nunca expone datos de tarjeta al backend, confirmado
línea por línea), Ley 19.628 (sin PII sensible persistida ni logueada de más), aislamiento entre
usuarios (el gap del paywall no permitía ver diagramas ajenos, solo operar sin pagar), y
secretos (sin credenciales hardcodeadas, `.env.local` correctamente ignorado).

**Fase 6 (SECURITY) parcialmente cerrada** — falta QA (casos de uso/esperables) y DELIVERY.
Pendiente antes de cobrar a usuarios reales: firma de webhook (alto, no bloqueante hoy).

---

### 2026-08-05 — QA valida generador-bpmn con ejecución real: 0 bugs, producción condicional

**77 verificaciones reales, 24 escenarios, 0 fallos** — no lectura de código, ejecución de
verdad: 4 llamadas reales a Claude API, 2 al sandbox de Mercado Pago, operaciones reales contra
Postgres (incluida una prueba explícita de que un usuario no puede leer el diagrama de otro),
HTTP real con `curl` contra el servidor de dev confirmando que el fix del paywall (Server
Actions) efectivamente redirige sin sesión, y re-parseo del XML exportado con `bpmn-moddle`
para confirmar BPMN 2.0 válido, no solo "se ve bien". Datos de prueba limpiados al terminar.

**Bloqueo conocido, no reportado como bug nuevo:** login real por Google no se pudo ejecutar en
este entorno (`AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` siguen siendo placeholders) — se verificó en
cambio que el fallo es controlado (NextAuth no tumba el servidor).

**Dos observaciones menores, no bloqueantes:** mensaje de error genérico de Mercado Pago ante
un 500 sin detalle, y falta página de error personalizada de NextAuth.

**Sign-off: código listo. Producción condicional** — cuatro bloqueos, todos de configuración,
ninguno de código:
1. Credenciales reales de Google OAuth (sin esto, nadie puede loguearse — 100% del acceso).
2. Credenciales de producción de Mercado Pago (hoy son `TEST-...`).
3. Dominio real de producción para `MERCADOPAGO_BACK_URL`.
4. Firma de webhook (ya señalado por SECURITY como alto, no bloqueante hoy).

**Entregables al cliente escritos:** `docs/QA-GENERADOR-BPMN-FASE6.md` (plan, test cases,
bugs, sign-off) y `docs/dossiers/generador-bpmn/CASOS-DE-USO-Y-ESPERABLES.md` (8 casos de uso
en lenguaje de negocio) — material base del Dossier de Diseño Detallado.

**Fase 6 cerrada en su parte de SECURITY + QA.** Falta DELIVERY para el handoff, y resolver los
4 bloqueos de configuración (le corresponden a Patricio, no son trabajo de agente) antes de
lanzar con cobro real.

---

### 2026-08-05 (cont.) — Producto nombrado "Mapea", desplegado en producción, y Free Trial de 3 días

**Naming:** PRODUCT MANAGER propuso y Patricio confirmó **"Mapea"** — `docs/NAMING-GENERADOR-BPMN.md`.
**Corrección de infraestructura:** `sistemaaiprocess` corre en **Vercel** (verificado con DNS
real), no self-hosted como decía la propuesta original — solo Postgres vive en el VPS/EasyPanel.

**Desplegado en producción: `mapea.aiprocess.cl`.** Patricio hizo el trabajo de cuenta (crear
proyecto Vercel, variables de entorno, dominio, credenciales OAuth) con guía de PM. Tres bugs de
configuración reales encontrados y resueltos en el camino (no de código):
1. `AUTH_URL` apuntaba a la URL temporal de Vercel en vez de `mapea.aiprocess.cl`.
2. `AUTH_SECRET` no llegaba a producción (se perdió al editar un campo "Sensitive" de Vercel,
   que no vuelve a mostrar el valor una vez guardado — hay que sobreescribir, no confiar en que
   ya estaba bien).
3. `AUTH_GOOGLE_SECRET` inválido (`invalid_client`) — se resolvió generando un secreto OAuth
   nuevo en Google Cloud Console (el original no se podía volver a ver).

DNS: `mapea.aiprocess.cl` es CNAME en Cloudflare (mismo proveedor que `aiprocess.cl`), con
proxy en "DNS only" (obligatorio para que Vercel emita el certificado). Advertencia de "sitio
peligroso" de Chrome al probar el login: falso positivo confirmado contra el Informe de
Transparencia oficial de Google Safe Browsing (dominio nuevo + URL con patrón `/signin/google`)
— login verificado funcionando de punta a punta por PM y por Patricio.

**Free Trial de 3 días implementado** (decisión de PRODUCT MANAGER, sección 8 de
`VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md`, a pedido de Patricio): usuario nuevo puede
crear **1 diagrama en total** (vía IA) durante los 3 días desde su registro, después queda
bloqueado con mensaje de conversión y precio visible. Bloqueo a nivel de servidor (Server
Actions), no solo de UI. Columna nueva `User.trialDiagramsCreated` (contador persistente, no
`Diagram.count()` en vivo — evita el loophole de borrar y regenerar el diagrama gratis sin
límite). Migración aplicada y verificada aislada (`public` intacto, sin tablas nuevas en
`generador_bpmn`). `tsc`/`eslint`/`build` limpios, verificado por PM de forma independiente.

**Nota:** el push de este commit dispara deploy automático a producción en Vercel (repo
conectado). Verificar `mapea.aiprocess.cl` después de que el deploy termine.

---

### 2026-08-02 (continuación) — Migración dominio misitioweb: iaenproceso.cl → aiprocess.cl (Patricio + DELIVERY)

**COMPLETADO:**
- ✅ Vercel project `app-procesos.vercel.app` → dominio principal `aiprocess.cl`
- ✅ DNS registrador actualizado (apunta a Vercel)
- ✅ Sitio accesible en `https://www.aiprocess.cl`
- ✅ Sitio accesible en `https://aiprocess.cl`

**Estado:** Migración completada, producción activa en nuevo dominio.

**Documentación actualizada:** BITACORA-CAMBIOS.md

**Próximo paso:** Validar que no hay referencias rotas a iaenproceso.cl en documentación.

---

### 2026-08-02 (continuación) — Cotizador reconstruido con catálogo real (PMcoordinador)

**Corrección crítica:** El cotizador inicial (`cotizador-sstt*.html`) usaba un modelo
inventado (2 UF/hora × 4h/día) que **no coincidía** con la documentación oficial ya
existente en `docs/CATALOGO-SERVICIOS.md`, `docs/VALORES-TIPO-COTIZACION.md` y
`docs/KIT-DIAGNOSTICO-SSTT.md`. Patricio lo detectó al revisar el resultado.

**Modelo real (precio fijo, no por hora):**
- Fase 1 Diagnóstico: Completo $450K (financiado 70%/30%) / Acotado $150K (100% cliente)
- Fase 2 por banda: Banda 1 $1.2M · Banda 2 $2.5M · Banda 3 $4.5M
- Productividad con IA: cargo único por persona (curso + entorno), precio no fijado
  aún en catálogo → dejado editable en el cotizador
- Mantención mensual por familia (Digitalizar $2-3K, Automatizar $3-5K, Anticipar $5-10K)
- Descuentos: bundle 5%, 3+ casos 10%, contrato anual+prepago 10%

**Archivo nuevo:** `apps/cotizador-iaprocess.html` (reemplaza los 3 intentos anteriores,
eliminados: `cotizador-sstt.html`, `-v2.html`, `-v3.html`)
- Genérico para las 4 familias (Productividad/Digitalizar/Automatizar/Anticipar),
  no solo SSTT — reutilizable para cualquier cliente futuro
- Cliente/Proyecto editables (actualizan título)
- Cálculo de descuentos y mantención mensual automático

**Lección:** Antes de construir herramientas de cotización, verificar primero si ya
existe modelo de precios documentado (`docs/VALORES-TIPO-COTIZACION.md` es la fuente
de verdad) en lugar de inventar una estructura genérica.

---

### 2026-08-02 — Hermes Operacional + Cotizador SSTT (PMcoordinador)

**HERMES GATEWAY - OPERACIONALIZADO:**
- ✅ Email Gateway funcional (Gmail SMTP configurado)
- ✅ Credencial válida: `pfcvvioyfjkxodwx` (2 UF/hora tarifa)
- ✅ Cron jobs activos:
  - `codebase-audit`: Viernes 5:00 PM (auditoría BPMN, preguntas SAP)
  - `market-weekly-brief`: Lunes 9:00 AM (reporte mercado semanal)
- ✅ Test email enviado a ferrer.patrixio@gmail.com ✓ Recibido
- ✅ Skills integradas: market-weekly-brief.yaml + codebase-audit.yaml

**CLIENTE SSTT ERNESTO ANDINO - COTIZADOR LISTO:**
- ✅ Creados templates contrato (3 documentos):
  - `CONTRATO-SERVICIOS-TEMPLATE.md` (precio, pago, deliverables)
  - `TERMINOS-CONDICIONES-TEMPLATE.md` (responsabilidades, confidencialidad, Ley 19.628)
  - `NDA-TEMPLATE.md` (información confidencial, duración 3 años)
- ✅ Aplicación interactiva HTML+JS: `cotizador-sstt.html`
  - Selector de fases (Diagnóstico 40 UF, Levantamiento 40 UF, Diseño 40 UF)
  - Cálculo automático (2 UF/hora → CLP)
  - Visor de documentos + checkboxes aceptación
  - Export PDF (manual via Print)
  - Completamente offline, sin dependencias

**Características Cotizador:**
- 3 pestañas: Cotización | Documentos | Resumen Final
- Fases dinámicas con preview
- Desglose de precios (UF + CLP)
- Condiciones pago seleccionables (50-50, 100%, 30-70, 0-100)
- Vigencia oferta configurable (7-90 días)
- Resumen ejecutivo para cliente

**Hallazgos SSTT:**
- Proceso real: distribuidor llega → guardián revisa → bodeguero reacondiciona → devuelve
- Problema: Pierden trazabilidad → no saben qué cobrar
- Solución: BPMN AS-IS/TO-BE + sistema trazabilidad

**Estado para reunión lunes 3 Ago:**
✅ Cotizador funcional (piloto)
✅ Documentos listos (templates editables)
✅ Hermes automático (reportes semanales)
✅ BACKLOG-IDEAS-FUTURAS.md creado (comparador BPMN como SAP Signavio)

---

### 2026-07-31 — Auditoría inicial de codebase (PMcoordinador)

**Cambios documentados:**
1. ✅ Creado CLAUDE.md v3.0 — Operacionalizado PMcoordinador (responsabilidades ejecutables, SLA 24h)
2. ✅ Actualizado MATRIZ_AGENTES.md v1.3 — Protocolo PM como HUB, agregado DISEÑADOR-UX
3. ✅ Creado diseñador-ux.md — Agente UX/UI con user journeys, testing, design system
4. ✅ Creado REPORTE-MERCADO-SEMANAL.md — Especificación semanal PRODUCT MANAGER (Haiku)
5. ✅ Creado TAREAS-RECURRENTES.md — Rutinas operacionales (lunes: mercado, viernes: auditoría)
6. ✅ Línea de negocio 3 documentada — Sistema SaaS de levantamiento de procesos

**Hallazgos de auditoría:**
- 🟡 **Estructura confusa:** `.agents/` y `.claude/` coexisten, pero sistemaaiprocess depende de `.agents/skills/ui-ux-pro-max`
- ✅ **Versiones sincronizadas:** CLAUDE.md v3.0 y MATRIZ_AGENTES.md v1.3 (2026-07-31)
- ⚠️ **BITACORA parcial:** Existía solo en sistemaaiprocess/, no en raíz
- ✅ **Symlinks encontrados:** `.claude/skills/geo-audit` → `.agents/skills/geo-audit` (frágil pero documentado)

**Commits:**
- `f1f7f7f` — v1.3: Protocolo PM como HUB + DISEÑADOR-UX
- `f459b15` — Línea de negocio 3
- `9dedff5` — CLAUDE.md v2.0 PMcoordinador
- `7dcd4b7` — CLAUDE.md v3.0 Operacionalizado
- `4afc0e6` — Tareas recurrentes + Product Manager report

**Plan de consolidación (.agents/ → .claude/):**
- [ ] Fase 1 (2026-08-07): Auditar referencias en sistemaaiprocess a .agents/
- [ ] Fase 2 (2026-08-14): Copiar/consolidar ui-ux-pro-max a .claude/skills/
- [ ] Fase 3 (2026-08-21): Actualizar referencias en docs y agents
- [ ] Fase 4 (2026-08-28): Eliminar .agents/ (después de validación)

---

### 2026-07-31 — Backup/Recovery + Agentes DELIVERY & SECURITY (continuación auditoría)

**Cambios:**
- ✅ Creado `SOP-BACKUP-RECOVERY.md` — estrategia completa (Git, Vercel, Supabase, disaster recovery)
- ✅ Creado `delivery.md` — go-live + DevOps (deployments, rollback 3 niveles, monitoring)
- ✅ Creado `security.md` — compliance Ley 19.628, control acceso, audit trail
- ⚠️ Hallazgo: No hay DBA explícito (DELIVERY + DEV lo hacen), crear en futuro si escala
- ⚠️ Hallazgo: .agents/ y .claude/ coexisten con dependencias frágiles (plan consolidación documentado)

**Commits:**
- `42076c1` — BITACORA-CAMBIOS.md + auditoría inicial
- `b22442f` — SOP-BACKUP-RECOVERY + DELIVERY + SECURITY

---

### 2026-07-27 — Setup inicial estructura 11 agentes + productos

**Cambios:** Creados agents/ con 11 agentes especializados (ARQUITECTO, DEV, QA, COMERCIAL, PRODUCT MANAGER, FINANCE, LEGAL, DISEÑADOR-UX + PMcoordinador).

**Productos:** /sistemaaiprocess/ + /misitioweb/ (rediseñado) + Línea negocio 3 (SaaS).

---

## 📊 ESTADO ACTUAL

| Componente | Versión | Fecha | Status |
|-----------|---------|-------|--------|
| CLAUDE.md | 3.0 | 2026-07-31 | ✅ Operativo |
| MATRIZ_AGENTES.md | 1.3 | 2026-07-31 | ✅ Operativo |
| Diseñador-UX | v1 | 2026-07-31 | ✅ Nuevo |
| Tareas recurrentes | v1 | 2026-07-31 | ✅ Nuevo |
| Línea negocio 3 | Documented | 2026-07-31 | 🟡 Planning |
| .agents/.claude overlap | Known | 2026-07-31 | 🟡 Consolidation pending |

---

### 2026-08-05 (cont. 2) — Compra de prueba completa: `/preapproval` cerrado end-to-end en sandbox

Patricio creó las cuentas de prueba Vendedor + Comprador, entró a la cuenta Vendedor, y creó
ahí una aplicación anidada — el paso que quedó pendiente desde el spike del 2026-08-04. Con esas
credenciales anidadas (que Mercado Pago llama "Credenciales de producción" pese a que la cuenta
es 100% simulada), PM completó las tres llamadas reales en cadena: `preapproval_plan` → `card_token`
→ `preapproval`, esta última con **`"status": "authorized"`** — suscripción de prueba activada
de verdad, cerrando el único gap que quedaba del spike.

**Tres hallazgos nuevos, documentados en `docs/referencia/MERCADO-PAGO.md` y
`docs/SPIKE-MERCADO-PAGO-BPMN-DESDE-PROMPT.md` sección 7:**
1. El plan y la suscripción deben crearse con el mismo par de credenciales — un plan de un
   "vendedor" no sirve para una suscripción de otro, aunque ambos sean de prueba.
2. `payer_email` no puede coincidir con la cuenta del vendedor (`"Payer and collector cannot be
   the same user"`) — mezclamos el email del Vendedor con el del Comprador al principio.
3. El `RUT` de prueba necesita un dígito verificador real (módulo 11), no un número inventado —
   incluso un "ejemplo oficial" encontrado por búsqueda web resultó tener formato inválido.

**Corregido también:** un plan duplicado que había quedado en la cuenta real de Mercado Pago de
Patricio (sin clientes activos, sin riesgo de cobro) — desactivado, queda solo el plan que usa
la app.

**Spike de Mercado Pago cerrado en su totalidad.** Con Fase 5 + Free Trial ya en producción
(`mapea.aiprocess.cl`) y esta validación completa, lo único que falta para cobrar de verdad es
que Patricio decida pasar a credenciales de producción — decisión de negocio, no técnica.

---

### 2026-08-05 (cont. 3) — Verificación de firma de webhook implementada

Cierra el último hallazgo pendiente de la auditoría de SECURITY (hallazgo #2,
`docs/AUDITORIA-SECURITY-FASE5-MERCADOPAGO.md`). DEV confirmó el algoritmo oficial de Mercado
Pago (HMAC-SHA256 sobre manifest `id:{data.id};request-id:{x-request-id};ts:{ts};`, comparado
contra `x-signature`) y lo implementó en `src/lib/mercadopago-webhook-signature.ts` +
`src/app/api/webhooks/mercadopago/route.ts`, con comparación constant-time
(`crypto.timingSafeEqual`). Si `MERCADOPAGO_WEBHOOK_SECRET` no está configurado, sigue
procesando sin verificar (comportamiento actual) pero con `console.warn` visible en cada
request — para que no pase desapercibido en producción. `tsc`/`eslint`/`build` limpios,
verificado por PM.

**Pendiente:** que Patricio configure `MERCADOPAGO_WEBHOOK_SECRET` (panel de Mercado Pago →
Webhooks de la aplicación) — el código ya está listo para leerlo apenas se agregue.

---

### 2026-08-05 (cont. 4) — Webhook configurado, ANTHROPIC_API_KEY rotada, límite de prompt, copy BPMN, y rediseño del editor de pasos

**Webhook:** Patricio configuró `MERCADOPAGO_WEBHOOK_SECRET` en el panel real (app
`sistemaBPMNBuilder`, modo de prueba) y en Vercel — cierre completo del hallazgo #2 de SECURITY.

**`ANTHROPIC_API_KEY` rota:** la key original (2026-08-04) dejó de funcionar en producción
(`401 invalid x-api-key`) al primer uso real por un usuario. Patricio generó una nueva, PM la
probó de forma independiente contra la API real antes de indicar el redeploy — confirmada
funcionando.

**Límite de caracteres del prompt:** ARQUITECTO IT investigó (patrones de UX de herramientas
comparables, costo real con Haiku 4.5, límites técnicos de Mermaid/exportar-bpmn) y recomendó
**4.000 caracteres, igual para trial y plan pago** — no es límite de costo ni técnico, es de
calidad del entregable (diagramas enormes se vuelven ilegibles). DEV implementó validación de
servidor (Zod `.max`) + contador `X/4.000` con aviso ámbar cerca del límite.
`docs/LIMITE-CARACTERES-PROMPT-BPMN.md`.

**Copy de exportación:** botón renombrado a "Descargar BPMN" con nota de compatibilidad
(Bizagi, demo.bpmn.io, Camunda); el preview Mermaid en pantalla ahora aclara que es un borrador
visual, no un archivo BPMN válido.

**Rediseño del editor de pasos** (pedido de UX de Patricio tras probar con un diagrama real
grande): botón "Editar" en vez de link de texto; popup/modal en vez de formulario inline
creciente; columna de número secuencial por paso; botones ↑/↓ para reordenar (sin cambio de
schema, reordena el array `pasos` en la BD). El resaltado del nodo correspondiente en el
diagrama Mermaid al editar (pedido como "solo si es de bajo esfuerzo") resultó viable — DEV lo
implementó post-procesando el SVG ya renderizado, sin tocar el motor de render. Revisado línea
por línea por PM, `tsc`/`eslint`/`build` limpios. **Pendiente: confirmación visual de Patricio
en producción** — ni DEV ni PM pueden completar un login real de Google para probarlo en
navegador (mismo límite de siempre).

**Pregunta de Patricio sobre "diagrama de valor / reporte de riesgos / recomendaciones de
errores de proceso" como secuencia guiada:** investigado — esos cuatro entregables corresponden
al rol del agente interno **ANALISTA DE PROCESOS DE NEGOCIO** de CONSULTORAVIRTUAL (uso interno
de la casa para levantamientos de cliente), **no** están documentados como parte del alcance de
Mapea. Ni la propuesta técnica original ni el análisis de viabilidad los mencionan. Queda
pendiente que Patricio confirme si es un alcance nuevo real para el producto o una confusión de
contexto.

---

### 2026-08-05 (cont. 5) — DECISIÓN GRANDE: Mapea absorbe la spec F02 de sistemaaiprocess

ANALISTA DE PROCESOS DE NEGOCIO definió una metodología de jerarquía guiada para Mapea (4
niveles: Diagrama de Valor → Proceso → Subproceso opcional → Procedimiento, con reportes de
riesgo en niveles 2-3), validada por Patricio (Diagrama de Valor = mapa de macroprocesos; sin
To-Be como quinto entregable). Ver `docs/METODOLOGIA-JERARQUIA-MAPEA.md`.

**Al revisar `sistemaaiprocess` en paralelo (pedido explícito de Patricio, "parece que
separamos"), se encontró que esta metodología ya existía especificada ahí, con mucho más
rigor, y sin construir:**

- `sistemaaiprocess/sdd/ROADMAP.md`: cadena completa de features F13→F01→**F02**→F03→F04→F06→F07→F08,
  todas en estado 📋 Planeado/Specify — **nada construido**.
- `sistemaaiprocess/sdd/features/F02/spec.md`: spec completa (487 líneas, 23 criterios de
  aceptación, 10 casos de uso) del "Diagramador BPMN" — el mismo problema que resuelve Mapea,
  pero con: validación de completitud con severidad (bloqueante/pendiente/sugerencia),
  validación 7PMG, coherencia cruzada con SIPOC (F01), tope de tamaño (15-20 actividades meta,
  50 nodos duro) con propuesta de descomposición en subprocesos, 3 niveles de corrección
  (edición directa / instrucción localizada / regeneración) con versionado, 4 formatos de
  exportación, y 6 restricciones de seguridad específicas contra inyección de prompt desde
  archivos de terceros (RS-1 a RS-6).
- `sistemaaiprocess/prompts/mapa-procesos-nivel0.md`: el "Diagrama de Valor" (Nivel 0) ya está
  resuelto — entrevista guiada, nomenclatura estricta de macroprocesos, clasificación en
  Estratégicos/Productivos/Apoyo, JSON de salida ya definido.

**Conclusión:** Mapea se construyó como MVP rápido y aislado de "solo generar el diagrama",
sin incorporar este roadmap más amplio que ya existía especificado pero nunca se implementó.

**Decisión de Patricio: Mapea absorbe/implementa la spec F02** (y eventualmente el resto de la
cadena — F01/F03/F04/F06/F07/F08) en vez de construir una versión más simple desde cero. La
spec F02 confirma que puede funcionar sin SIPOC previo (no bloquea, ofrece derivarlo después),
así que no hace falta construir F13/F01 primero.

**Próximo paso:** ARQUITECTO IT hace el análisis de brecha entre lo que existe hoy en
`generador-bpmn` y lo que exige la spec F02, antes de que DEV toque código — es un cambio
grande, mismo rigor que el diseño original del producto.

---

## 🎯 PRÓXIMAS AUDITORÍAS

- **Próximo semanal:** 2026-08-08 (viernes)
- **Consolidación .agents:** 2026-08-07 a 2026-08-28

---

*Mantenido por: PMcoordinador*  
*Última auditoría: 2026-07-31*
