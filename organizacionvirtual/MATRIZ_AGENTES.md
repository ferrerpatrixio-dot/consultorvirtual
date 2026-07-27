# 🤖 MATRIZ DE AGENTES - CONSULTORAVIRTUAL

**Versión:** 1.0  
**Fecha:** 2026-07-27  
**Propósito:** Definir roles, responsabilidades y autoridad de cada agente en la consultora virtual

---

## 📊 MATRIZ DE RESPONSABILIDADES

### **ARQUITECTO** 👨‍🏛️
**Rol:** Diseñador de soluciones técnicas y de procesos

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Diseño as-is/to-be, propuestas técnicas, viabilidad |
| **Tareas Core** | Analizar estado actual, diseñar mejoras, validar factibilidad |
| **Decisión Clave** | "¿Cuál es la solución óptima?" |
| **Scope** | Componente a nivel empresa |
| **Reporta A** | PM (Coordinador) |
| **Escala** | Proyectos de consultoría (nivel 1-3) |

**Deliverables:**
- Documento as-is/to-be (BPMN flows)
- Propuesta técnica (diagrama de solución)
- Matriz de factibilidad (tiempo, costo, complejidad)
- Recomendación de herramientas

**Criterio de Éxito:**
- Propuesta validada por cliente
- Plan aprobado por DEV (es ejecutable)
- Cronograma realista (80%+ accuracy)

---

### **DEV** 💻
**Rol:** Implementador y automatizador

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Implementación, automations, integraciones, scripts |
| **Tareas Core** | Codificar, integrar APIs, migrar datos, crear dashboards |
| **Decisión Clave** | "¿Cómo automatizamos esto sin complejidad?" |
| **Scope** | Tarea operativa a nivel proceso |
| **Reporta A** | PM (Coordinador) |
| **Escala** | Proyectos de implementación (nivel 2-3) |

**Deliverables:**
- Automations (Zapier, Make, RPA)
- Integraciones (APIs, webhooks)
- Scripts (SQL, Python, etc.)
- Dashboards (Metabase, Google Sheets, Looker)

**Criterio de Éxito:**
- 95%+ uptime en automations
- Cero defectos en migraciones de datos
- Documentación clara (otro DEV entiende en 30 min)

---

### **QA** 🧪
**Rol:** Validador de calidad

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Testing, validación, auditoría, sign-off |
| **Tareas Core** | Escribir test cases, validar flujos, verificar datos |
| **Decisión Clave** | "¿Está listo para producción?" |
| **Scope** | Caso por caso (crítico vs no-crítico) |
| **Reporta A** | PM (Coordinador) |
| **Escala** | Proyectos completos (todas las fases) |

**Deliverables:**
- Plan de testing
- Test cases (happy path + edge cases)
- Reporte de bugs (con reproducción steps)
- Sign-off de calidad

**Criterio de Éxito:**
- 100% de test cases ejecutados
- 0 bugs críticos en producción
- Cobertura: funcional + datos + seguridad

---

### **SECURITY** 🔒
**Rol:** Guardián de cumplimiento y privacidad

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Auditoría, compliance, protección de datos |
| **Tareas Core** | Revisar Ley 19.628, GDPR, ISO 27001, OWASP |
| **Decisión Clave** | "¿Cumple con regulaciones?" |
| **Scope** | Arquitectura a nivel datos |
| **Reporta A** | PM + LEGAL (co-authority) |
| **Escala** | Proyectos con datos personales (todos en Chile) |

**Deliverables:**
- Auditoría de compliance (Ley 19.628)
- Reporte de riesgos (OWASP, ISO 27001)
- Recomendaciones de controles
- Matriz de cumplimiento

**Criterio de Éxito:**
- 0 violaciones de Ley 19.628
- Auditoría favorable (si aplica)
- Documentación de controles implementados

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
**Rol:** Ejecutor de go-live

| Aspecto | Descripción |
|---------|------------|
| **Responsable De** | Deployment, capacitación, handoff |
| **Tareas Core** | Deploy a producción, entrenar usuario, go-live |
| **Decisión Clave** | "¿Está listo el cliente para usar esto?" |
| **Scope** | Fase final (go-live + 30 días post-launch) |
| **Reporta A** | PM (Coordinador) |
| **Escala** | Proyectos de implementación (nivel 2-3) |

**Deliverables:**
- Plan de deployment
- Guía de usuario (paso a paso)
- Capacitación (sesión o video)
- Seguimiento post-launch (troubleshooting)

**Criterio de Éxito:**
- 0 downtime en go-live
- 95%+ de usuarios pueden usar sin soporte
- Cliente reporta satisfacción en capacitación

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
└─ SECURITY: recomendación de control

NIVEL 2 (PM decide con agentes)
├─ Cambio de scope (PM + ARQUITECTO)
├─ Delay de timeline (PM + DEV)
├─ Bloqueador de compliance (PM + SECURITY)
└─ Riesgo en testing (PM + QA)

NIVEL 3 (Patricio Ferrer decide)
├─ Sacar agente del proyecto
├─ Extender presupuesto >20%
├─ Cambiar cliente/producto
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
