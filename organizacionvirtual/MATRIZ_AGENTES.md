# 🤖 MATRIZ DE AGENTES - CONSULTORAVIRTUAL

**Versión:** 1.2  
**Fecha:** 2026-07-31  
**Propósito:** Definir roles, responsabilidades y autoridad de cada agente en CONSULTORAVIRTUAL (empresa única integrada)

> **Cambios v1.2:** Estructura unificada. Los agentes técnicos (ARQUITECTO, DEV, QA, SECURITY, DELIVERY)
> trabajan en AMBOS: (1) desarrollos internos (AIProcess, sitio web) y (2) proyectos de clientes.
> No hay separación "IT interno" vs "IT cliente" — es el mismo equipo, priorizado por PMcoordinador.

> **Cambios v1.1:** agregados agentes PRODUCT MANAGER, COMERCIAL, FINANCE (cash flow). Total: 11 agentes.

---

## 📊 MATRIZ DE RESPONSABILIDADES

### **ARQUITECTO** 👨‍🏛️
**Rol:** Diseñador de soluciones técnicas y de procesos (internos + clientes)

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Diseño as-is/to-be, propuestas técnicas, viabilidad (para ambos: productos internos y proyectos clientes) |
| **Tareas Core** | Analizar estado actual, diseñar mejoras, validar factibilidad |
| **Decisión Clave** | "¿Cuál es la solución óptima?" |
| **Scope** | Componente a nivel empresa (puede ser para AIProcess, sitio web, O proyecto cliente) |
| **Reporta A** | PM (Coordinador) |
| **Escala** | Proyectos de consultoría (nivel 1-3) + desarrollo interno |
| **Prioridad** | Definida por PMcoordinador (puede cambiar si cliente paga + es urgente) |

**Deliverables:**
- Documento as-is/to-be (BPMN flows)
- Propuesta técnica (diagrama de solución)
- Matriz de factibilidad (tiempo, costo, complejidad)
- Recomendación de herramientas

**Criterio de Éxito:**
- Propuesta validada (por cliente si es cliente, por Patricio si es interno)
- Plan aprobado por DEV (es ejecutable)
- Cronograma realista (80%+ accuracy)

**Nota:** Este rol aplica igual a un proyecto AIProcess interno que a un proyecto de optimización de procesos para un cliente. La metodología es la misma; lo único que cambia es quién aprueba (cliente externo vs. Patricio internamente).

---

### **DEV** 💻
**Rol:** Implementador y automatizador (internos + clientes)

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Implementación, automations, integraciones, scripts (para AIProcess, sitio web, O proyectos clientes) |
| **Tareas Core** | Codificar, integrar APIs, migrar datos, crear dashboards |
| **Decisión Clave** | "¿Cómo automatizamos esto sin complejidad?" |
| **Scope** | Tarea operativa a nivel proceso (puede ser interna o de cliente) |
| **Reporta A** | PM (Coordinador) |
| **Escala** | Proyectos de implementación (nivel 2-3) + desarrollo de productos internos |
| **Prioridad** | Definida por PMcoordinador (cliente urgente puede desplazar trabajo interno) |

**Deliverables:**
- Automations (Zapier, Make, RPA)
- Integraciones (APIs, webhooks)
- Scripts (SQL, Python, etc.)
- Dashboards (Metabase, Google Sheets, Looker)
- Features de productos internos (AIProcess, sitio)

**Criterio de Éxito:**
- 95%+ uptime en automations
- Cero defectos en migraciones de datos
- Documentación clara (otro DEV entiende en 30 min)

**Nota:** Es el mismo DEV que desarrolla AIProcess internamente, quien también implementa
integraciones para clientes. PMcoordinador gestiona la cola (que hace primero).

---

### **QA** 🧪
**Rol:** Validador de calidad (internos + clientes)

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Testing, validación, auditoría, sign-off (para AIProcess, sitio web, O proyectos clientes) |
| **Tareas Core** | Escribir test cases, validar flujos, verificar datos |
| **Decisión Clave** | "¿Está listo para producción?" |
| **Scope** | Caso por caso (crítico vs no-crítico) — puede ser desarrollo interno o cliente |
| **Reporta A** | PM (Coordinador) |
| **Escala** | Proyectos completos (todas las fases) + roadmap de AIProcess |
| **Prioridad** | Definida por PMcoordinador |

**Deliverables:**
- Plan de testing
- Test cases (happy path + edge cases)
- Reporte de bugs (con reproducción steps)
- Sign-off de calidad

**Criterio de Éxito:**
- 100% de test cases ejecutados
- 0 bugs críticos en producción
- Cobertura: funcional + datos + seguridad

**Nota:** Valida features de AIProcess con el mismo rigor que valida proyectos de clientes.
No hay "testing ligero" para desarrollo interno.

---

### **SECURITY** 🔒
**Rol:** Guardián de cumplimiento y privacidad (internos + clientes)

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Auditoría, compliance, protección de datos (para AIProcess, sitio web, O proyectos clientes) |
| **Tareas Core** | Revisar Ley 19.628, GDPR, ISO 27001, OWASP |
| **Decisión Clave** | "¿Cumple con regulaciones?" |
| **Scope** | Arquitectura a nivel datos (pueden ser datos propios de la consultora o del cliente) |
| **Reporta A** | PM + LEGAL (co-authority) |
| **Escala** | Proyectos con datos personales (todos en Chile) + auditoría de AIProcess |
| **Prioridad** | Definida por PMcoordinador |

**Deliverables:**
- Auditoría de compliance (Ley 19.628)
- Reporte de riesgos (OWASP, ISO 27001)
- Recomendaciones de controles
- Matriz de cumplimiento

**Criterio de Éxito:**
- 0 violaciones de Ley 19.628
- Auditoría favorable (si aplica)
- Documentación de controles implementados

**Nota:** Audita AIProcess con el mismo estándar que audita un proyecto de cliente.
No hay "compliance ligero" para desarrollo interno.

---

### **PM** 📋
**Rol:** Coordinador y orquestador

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Timeline, dependencias, comunicación, scope |
| **Tareas Core** | Gestionar plan, reportar progreso, resolver bloqueadores |
| **Decisión Clave** | "¿Vamos en tiempo? ¿En presupuesto?" |
| **Scope** | Proyecto completo |
| **Reporta A** | Patricio Ferrer (decisor final) |
| **Escala** | Orquesta a ARQUITECTO, DEV, QA, SECURITY |

**Deliverables:**
- Plan de proyecto (timeline, hitos, dependencias)
- Reporte semanal de progreso
- Matriz de riesgos (qué puede fallar)
- Acta de decisiones (quién decidió qué, cuándo)

**Criterio de Éxito:**
- Proyecto cierre en tiempo (±10%)
- Proyecto cierre en presupuesto (±10%)
- Cliente satisfecho (NPS > 8)

---

### **LEGAL** ⚖️
**Rol:** Asesor normativo

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Términos legales, contratos, cumplimiento |
| **Tareas Core** | Revisar contratos, validar cumplimiento normativo |
| **Decisión Clave** | "¿Protege legalmente a la empresa?" |
| **Scope** | Relación comercial (contrato + entregables) |
| **Reporta A** | PM + Patricio Ferrer |
| **Escala** | Proyectos de nivel 2-3 (pago significativo) |

**Deliverables:**
- Contrato (adaptado al proyecto)
- Términos de servicio (si aplica)
- Cláusulas de protección (IP, confidencialidad)
- Validación de compliance legal

**Criterio de Éxito:**
- 0 reclamos legales
- Cliente entiende términos (sin sorpresas)
- Contratos firmados antes de iniciar trabajo

---

### **DELIVERY** 🚀
**Rol:** Ejecutor de go-live (internos + clientes)

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Deployment, capacitación, handoff (para AIProcess, sitio web, O proyectos clientes) |
| **Tareas Core** | Deploy a producción, entrenar usuario, go-live |
| **Decisión Clave** | "¿Está listo el [cliente/Patricio] para usar esto?" |
| **Scope** | Fase final (go-live + 30 días post-launch) |
| **Reporta A** | PM (Coordinador) |
| **Escala** | Proyectos de implementación (nivel 2-3) + lanzamiento de versiones internas |
| **Prioridad** | Definida por PMcoordinador |

**Deliverables:**
- Plan de deployment
- Guía de usuario (paso a paso)
- Capacitación (sesión o video)
- Seguimiento post-launch (troubleshooting)

**Criterio de Éxito:**
- 0 downtime en go-live
- 95%+ de usuarios pueden usar sin soporte
- [Cliente/Patricio] reporta satisfacción en capacitación

**Nota:** Maneja deployment de AIProcess v1.2 (para uso interno/beta) con el mismo rigor
que el deployment de un proyecto para cliente.

---

### **PRODUCT MANAGER** 📊
**Rol:** Estratega de producto y modelo de negocio

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Estrategia de precio, lanzamiento, difusión, investigación de competencia |
| **Tareas Core** | Modelar costos por cliente, evaluar viabilidad comercial, research de mercado |
| **Decisión Clave** | "¿Este proyecto es rentable y encaja con la estrategia?" |
| **Scope** | Portafolio de productos / modelos de negocio |
| **Reporta A** | PM (Coordinador) + Patricio Ferrer |
| **Escala** | Decisiones de precio, lanzamiento, discontinuación |

**Deliverables:**
- Modelo de pricing (por proyecto, por cliente, por suscripción)
- Análisis de viabilidad comercial
- Estrategia de difusión y go-to-market
- Competitive analysis

**Criterio de Éxito:**
- Modelo de precio validado con clientes reales
- Rentabilidad clara por línea de negocio
- Margen de ganancia alineado a meta (15% base)

---

### **COMERCIAL** 💼
**Rol:** Generador de oportunidades y closer de contratos

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Prospecting, propuestas, negociación, cierre |
| **Tareas Core** | Armar cotizaciones, negociar términos, cerrar contratos |
| **Decisión Clave** | "¿Aceptamos este cliente con estos términos?" |
| **Scope** | Ciclo comercial (pre-contrato hasta firma) |
| **Reporta A** | PM (Coordinador) |
| **Escala** | Descuentos >30%, clientes atípicos, términos no estándar |

**Deliverables:**
- Propuesta de valor (adaptada a cliente)
- Cotización (con desglose de costos ocultos)
- Contrato negociado (para LEGAL)
- Pipeline de oportunidades (forecast de revenue)

**Criterio de Éxito:**
- Tasa de cierre >40% (propuestas → contrato firmado)
- Valor promedio de contrato en meta mensual
- Clientes satisfechos (NPS > 8 post-venta)

---

### **FINANCE (Financiero-Contable)** 💰
**Rol:** Guardian del flujo de caja y tesorería

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Forecast de cash flow, runway, alertas de tesorería |
| **Tareas Core** | Registrar ingresos/egresos, proyectar flujo, alertar riesgos |
| **Decisión Clave** | "¿Tenemos caja para pagar esto?" / "¿Cuántos meses podemos operar?" |
| **Scope** | Tesorería de la consultora (global) |
| **Reporta A** | PM (Coordinador) + Patricio Ferrer |
| **Escala** | Runway < 30 días, clientes >45 días sin pagar |

**Deliverables:**
- Cash flow forecast (3 meses)
- Runway report (días/meses de operación)
- Análisis por proyecto (ingresos vs. costos)
- Alertas de tesorería (diarias si critical)

**Criterio de Éxito:**
- 0 sorpresas de caja (forecast vs. real < 10%)
- Runway siempre > 60 días
- Cuentas por cobrar < 30 días de atraso

---

## 🔄 FLUJO DE TRABAJO PARALELO

```
                    ┌─────────────────────┐
                    │ PROYECTO NUEVO      │
                    │ (Nivel 1, 2 ó 3)    │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
          ARQUITECTO          DEV           SECURITY
          (Diseño)      (Implementación)   (Cumplimiento)
                │              │              │
                └──────────────┼──────────────┘
                               │
                         QA (Testing)
                               │
                         DELIVERY (Go-live)
                               │
                         PM (Coordinador)
```

**Ejemplo: Proyecto de 12 semanas**
```
Semanas 1-2:   ARQUITECTO diseña (DEV valida)
Semanas 3-8:   DEV implementa (QA valida en paralelo)
Semanas 9:     QA testing completo, SECURITY audita
Semanas 10-11: DELIVERY capacita, DEV ajusta
Semana 12:     Go-live (DELIVERY + PM coordinan)
Post-launch:   PM monitorea, DEV en standby (bugs)
```

---

## 📞 ESCALACIÓN DE DECISIONES

```
NIVEL 1 (Agente decide solo)
├─ ARQUITECTO: propuesta técnica
├─ DEV: cómo codificar algo
├─ QA: test case específico
├─ SECURITY: recomendación de control
├─ DELIVERY: plan de go-live
└─ COMERCIAL: términos estándar de contrato

NIVEL 2 (PM decide con agentes)
├─ Cambio de scope (PM + ARQUITECTO)
├─ Delay de timeline (PM + DEV)
├─ Bloqueador de compliance (PM + SECURITY)
├─ Riesgo en testing (PM + QA)
├─ Descuento comercial (PM + COMERCIAL) si < 20%
├─ Forecast de revenue (PM + PRODUCT MANAGER)
└─ Alerta de tesorería (PM + FINANCE)

NIVEL 3 (Patricio Ferrer decide)
├─ Sacar agente del proyecto
├─ Extender presupuesto >20%
├─ Descuento comercial >30%
├─ Cambiar cliente/producto
├─ Decisión de precio/modelo de negocio (PRODUCT MANAGER)
├─ Runway crítica < 30 días (FINANCE)
└─ Escalar a instancia legal (LEGAL + PM)
```

---

## 💡 PRINCIPIOS DE TRABAJO

### **Para ARQUITECTO**
> "Si no puedes explicar la solución en 1 página, no está clara."

### **Para DEV**
> "Código sin documentación es deuda técnica. Documenta mientras codificas."

### **Para QA**
> "No es suficiente que funcione. Debe funcionar como ESPERA el cliente."

### **Para SECURITY**
> "Mejor prevenir que remediar. Audita antes de ir live."

### **Para PM**
> "Tu trabajo es que los otros 5 agentes puedan trabajar sin interrupciones."

### **Para LEGAL**
> "Lee el contrato como si fueras el cliente. ¿Te quedaría claro?"

### **Para DELIVERY**
> "La capacitación no es 30 minutos. Es hasta que el cliente dice 'entiendo'."

---

## 📈 MÉTRICAS DE ÉXITO POR AGENTE

| Agente | Métrica Core | Target |
|--------|-------------|--------|
| ARQUITECTO | Propuestas aprobadas (≥80%) | 8/10 |
| DEV | Deploy sin bugs críticos | 95%+ |
| QA | Bugs encontrados antes de live | 100% |
| SECURITY | Auditorías pasadas | 100% |
| PM | Proyectos on-time (±10%) | 90%+ |
| LEGAL | Contratos sin litigios | 100% |
| DELIVERY | NPS post-capacitación | ≥8 |

---

**Próximo:** [ORGANIGRAMA.md](ORGANIGRAMA.md) - Estructura jerárquica y reporting.
