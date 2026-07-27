# 🏢 ORGANIGRAMA - CONSULTORAVIRTUAL

**Fecha:** 2026-07-27  
**Estructura:** Consultora Virtual con 7 Agentes + 1 Decisor Humano

---

## 📊 ESTRUCTURA JERÁRQUICA

```
                          ┌──────────────────┐
                          │  Patricio Ferrer │
                          │  (Decisor Final) │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │                             │
            ┌───────▼────────┐         ┌─────────▼──────────┐
            │  PM (Coordinador)        │ LEGAL (Asesor)    │
            │  Orquestra todo          │ Términos + Contrat│
            └────────┬────────┘         └───────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼──┐   ┌────▼──┐   ┌────▼──┐
   │ARQUIT.│   │  DEV  │   │  QA   │
   │Diseño │   │Implem │   │Testing│
   └───────┘   └───────┘   └───────┘
   
   ┌────────────────┐
   │   SECURITY     │
   │  Cumplimiento  │
   └────────────────┘
   
   ┌────────────────┐
   │   DELIVERY     │
   │    Go-live     │
   └────────────────┘
```

---

## 👥 ROLES Y PERSONAS

### **Nivel 1: Decisor Humano**

**PATRICIO FERRER** (Founder & CEO)
- **Decisiones:** Estrategia, presupuesto, escalación crítica
- **Reportes que recibe:** Mensual (estado de proyectos + revenue)
- **Responsable de:** Venta, client satisfaction, dirección

---

### **Nivel 2: Coordinación & Normativa**

**PM (Coordinador)**
- **Rol:** Orquestra a todos los agentes
- **Reporta a:** Patricio Ferrer
- **Supervisa:** ARQUITECTO, DEV, QA, DELIVERY (proyecto a proyecto)
- **Decide:** Timeline, scope, prioridades
- **Escalación a Patricio:** Decisiones >20% presupuesto, cambio de cliente

**LEGAL (Asesor)**
- **Rol:** Protege legalmente, revisa contratos
- **Reporta a:** Patricio Ferrer + PM (co-authority)
- **Escalación a Patricio:** Reclamo legal, contrato atípico

---

### **Nivel 3: Equipos de Trabajo (Proyecto)**

**ARQUITECTO** (Diseño)
- Reporta a: PM
- Trabaja con: DEV (valida viabilidad), QA (para testing plan)
- Autoridad en: Diseño técnico, propuestas

**DEV** (Implementación)
- Reporta a: PM
- Trabaja con: ARQUITECTO (interpreta diseño), QA (testing), DELIVERY (handoff)
- Autoridad en: Cómo ejecutar técnicamente

**QA** (Testing)
- Reporta a: PM
- Trabaja con: DEV (valida entrega), ARQUITECTO (entiende diseño), DELIVERY (pre-launch)
- Autoridad en: Calidad, sign-off

**SECURITY** (Cumplimiento)
- Reporta a: PM + LEGAL (co-authority)
- Trabaja con: ARQUITECTO (diseño seguro), DEV (código seguro), QA (test de seguridad)
- Autoridad en: Compliance, riesgos, controles

**DELIVERY** (Go-Live)
- Reporta a: PM
- Trabaja con: DEV (entender sistema), QA (pre-launch), cliente (capacitación)
- Autoridad en: Deployment, capacitación, adopción

---

## 🔀 MATRIZ RACI (Quién Hace Qué)

| Tarea | ARQUITECTO | DEV | QA | SECURITY | PM | LEGAL | DELIVERY |
|------|---|---|---|---|---|---|---|
| Diseñar solución | **R** | A | C | A | I | I | C |
| Propuesta técnica | **R/A** | C | - | - | I | - | - |
| Implementar | C | **R/A** | C | A | I | - | - |
| Testing | C | A | **R/A** | A | I | - | C |
| Auditoría legal | - | - | - | C | C | **R/A** | - |
| Auditoría compliance | C | A | A | **R/A** | I | A | - |
| Deploy a prod | C | A | A | C | **C** | - | **R** |
| Capacitación usuario | - | C | - | - | I | - | **R/A** |
| Reporte al cliente | - | - | - | - | **R** | C | A |

**Leyenda:**
- **R** = Responsible (hace el trabajo)
- **A** = Accountable (toma decisión final, tiene autoridad)
- **C** = Consulted (opinión importante)
- **I** = Informed (tiene que saber)

---

## 📅 CICLO DE VIDA DE PROYECTO

### **FASE 1: Discovery (Semana 1)**
```
Cliente llega →  PM agendar intake
                 ARQUITECTO hace call discovery
                 LEGAL revisa contrato
                 → PM presenta propuesta
```

### **FASE 2: Diseño (Semanas 2-3)**
```
PM inicia proyecto
ARQUITECTO diseña solución
├─ Valida con DEV (¿es ejecutable?)
├─ Valida con SECURITY (¿cumple normas?)
└─ Valida con QA (¿qué testear?)
```

### **FASE 3: Implementación (Semanas 4-10)**
```
DEV implementa (en paralelo)
├─ ARQUITECTO revisa (sigue el plan)
├─ QA escribe test cases
├─ SECURITY audita código
└─ PM reporta progreso
```

### **FASE 4: Testing (Semanas 11-12)**
```
QA testea
├─ DEV arregla bugs
├─ SECURITY valida correcciones
├─ DELIVERY se prepara (doc + capacitación)
└─ PM coordina sign-off
```

### **FASE 5: Go-Live (Semana 13)**
```
DELIVERY deploya
├─ DEV en standby (bugs)
├─ QA monitorea (issues)
└─ DELIVERY capacita cliente
```

### **FASE 6: Post-Launch (Semanas 14-16)**
```
DEV soporta bugs
DELIVERY hace follow-up
PM cierra proyecto
```

---

## 📞 CADENA DE COMUNICACIÓN

### **Problema Común → Quién Lo Resuelve**

| Problema | Responsable | Escalación |
|----------|------------|-----------|
| Bug en código | DEV (arregla) | PM (si afecta timeline) |
| No pasa test | QA reporta → DEV arregla | PM (si demora >2 días) |
| Riesgo compliance | SECURITY reporta | LEGAL + PM (si es crítico) |
| Cambio de alcance | PM negocia | Patricio Ferrer (>20%) |
| Cliente insatisfecho | PM resuelve | Patricio Ferrer (escala) |
| Bloqueador legal | LEGAL resuelve | Patricio Ferrer (no resuelto) |

---

## 🎯 VELOCIDAD POR NIVEL DE PROYECTO

```
NIVEL 1 (Diagnóstico, Gratis)
├─ ARQUITECTO: no participa
├─ DEV: no participa
├─ QA: no participa
├─ SECURITY: valida Ley 19.628 solamente
├─ PM: coordina delivery
├─ LEGAL: no participa
└─ DELIVERY: no participa
Timeline: 1 día (async)

NIVEL 2 (Consultoría, $1.5K-$3K)
├─ ARQUITECTO: 2-3 días (diseño)
├─ DEV: support only (no implementa)
├─ QA: no participa
├─ SECURITY: valida propuesta (1 día)
├─ PM: coordina (full-time 1 semana)
├─ LEGAL: revisa contrato (1 día)
└─ DELIVERY: no participa
Timeline: 1 semana

NIVEL 3 (Implementación, $6K-$15K)
├─ ARQUITECTO: full-time (2-3 semanas)
├─ DEV: full-time (6-8 semanas)
├─ QA: full-time (8-10 semanas)
├─ SECURITY: 2-3 semanas (distributed)
├─ PM: full-time (12 semanas)
├─ LEGAL: 3-5 días (inicio + final)
└─ DELIVERY: 2 semanas (final)
Timeline: 12 semanas
```

---

## 💰 ASIGNACIÓN DE COSTOS

```
NIVEL 1 (Diagnóstico): $0 (lead gen)
├─ SECURITY: 2h audit
├─ PM: 8h coordination
└─ Cost: ~$200 (marginal)

NIVEL 2 (Consultoría): $1.5K-$3K
├─ ARQUITECTO: 3 days × $300/day = $900
├─ SECURITY: 1 day × $300/day = $300
├─ PM: 5 days × $250/day = $1.250
├─ LEGAL: 1 day × $400/day = $400
├─ DEV: support only ($0)
└─ Costo total: ~$2.850 (vs $3K margen bruto)

NIVEL 3 (Implementación): $6K-$15K
├─ ARQUITECTO: 20 days × $300 = $6.000
├─ DEV: 50 days × $400 = $20.000 (outsourced/tools)
├─ QA: 20 days × $250 = $5.000 (tools + testing)
├─ SECURITY: 15 days × $300 = $4.500
├─ PM: 60 days × $250 = $15.000 (LEAD)
├─ LEGAL: 5 days × $400 = $2.000
├─ DELIVERY: 10 days × $250 = $2.500
└─ Costo total: ~$55K (vs $10K-$15K margen → OUTSOURCE DEV)
```

---

## 🚨 ESCENARIOS DE CRISIS

### **Escenario 1: Cliente dice "No es lo que pedí"**
```
DELIVERY reporta → PM investiga
PM habla con ARQUITECTO + DEV
├─ Si es error nuestro: PM + DEV arreglan (sin costo adicional)
├─ Si es cliente cambió idea: PM + LEGAL negocian scope adicional
└─ Si es crítico: Patricio Ferrer interviene
```

### **Escenario 2: Se descubre issue de compliance**
```
SECURITY reporta → PM notifica LEGAL
LEGAL + SECURITY crean plan de corrección
├─ Si es menor: DEV arregla, SECURITY valida (0 costo cliente)
├─ Si es mayor: PM + LEGAL negocia cambio de contrato
└─ Si es crítico: Patricio Ferrer toma decisión (puede ser rollback)
```

### **Escenario 3: DEV no puede terminar a tiempo**
```
PM detecta en semana 8 → PM + ARQUITECTO hacen plan de contingencia
├─ Opción A: Extender timeline 1-2 semanas (DEV trabaja más)
├─ Opción B: MVP approach (lanzar core, secondary after)
└─ Escalación: Patricio Ferrer decide (afecta reputación)
```

---

## 📋 CHECKLIST DE ROLES

- [ ] Cada agente tiene README.md en su carpeta
- [ ] Cada agente entiende sus responsabilidades (MATRIZ_AGENTES.md)
- [ ] Cada agente sabe a quién reporta (ORGANIGRAMA.md)
- [ ] LEGAL tiene template de contrato
- [ ] PM tiene template de plan de proyecto
- [ ] SECURITY tiene checklist de auditoría

---

**Próximo:** Cada agente debe leer su README y completar su setup en su carpeta.
