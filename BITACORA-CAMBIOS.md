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

## 🎯 PRÓXIMAS AUDITORÍAS

- **Próximo semanal:** 2026-08-08 (viernes)
- **Consolidación .agents:** 2026-08-07 a 2026-08-28

---

*Mantenido por: PMcoordinador*  
*Última auditoría: 2026-07-31*
