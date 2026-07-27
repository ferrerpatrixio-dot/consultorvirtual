# 🧠 ASIGNACIÓN DE MODELOS DE PENSAMIENTO - AGENTES

**Objetivo:** Optimizar poder computacional por complejidad de tareas  
**Criterio:** Reasoning complexity + Decision importance + Cost  
**Versión:** 1.0  

---

## 📊 MATRIZ DE MODELOS

| Agente | Modelo Recomendado | Razonamiento | Tareas Tipo |
|--------|-------------------|--------------|------------|
| **ARQUITECTO** | 🟣 Opus | Alto (trade-offs, complejidad) | Diseño soluciones, análisis alternativas |
| **DEV** | 🟢 Sonnet | Medio | Implementación, debugging, integración |
| **QA** | 🟡 Sonnet | Medio | Testing, validación, edge cases |
| **SECURITY** | 🟣 Opus | Alto (compliance, riesgos) | Auditoría, análisis amenazas, regulaciones |
| **UI/UX** | 🟢 Sonnet | Medio | Diseño interface, evaluación UX |
| **DELIVERY** | 🟡 Haiku | Bajo | Capacitación, documentación, checklist |
| **PROJECT MANAGER (YO)** | 🟣 Opus | Alto (coordinación, decisiones) | Mediación, escalaciones, estrategia |
| **PRODUCT MANAGER** | 🟣 Opus | Alto (mercado, estrategia) | Análisis mercado, pricing, oportunidades |
| **COMERCIAL** | 🟢 Sonnet | Medio | Cotizaciones, propuestas, negocios |
| **LEGAL** | 🟣 Opus | Alto (compliance, interpretación) | Contratos, NDA, análisis legal |
| **FINANCE/CFO** | 🟢 Sonnet | Medio | Cálculos, reportes, presupuestos |

---

## 🧬 DESCRIPCIÓN DE MODELOS

### 🟣 OPUS (Extended Thinking / Razonamiento Profundo)

**Capacidades:**
- Razonamiento complejo y multi-paso
- Análisis de trade-offs
- Decisiones estratégicas
- Interpretación de ambigüedades
- Síntesis de información compleja

**Casos de uso:**
- Diseño arquitectónico con múltiples opciones
- Análisis de cumplimiento legal
- Evaluación de riesgos (security)
- Decisiones estratégicas de mercado
- Mediación de conflictos complejos
- Análisis financiero con múltiples variables

**Costo:** Mayor (usa más tokens)  
**Tiempo respuesta:** Más lento (pero mejor calidad)

---

### 🟢 SONNET (Equilibrio Velocidad-Calidad)

**Capacidades:**
- Reasoning bueno (no extremo)
- Velocidad adecuada
- Ejecución clara
- Buena contextualización

**Casos de uso:**
- Implementación de soluciones definidas
- Validación de requisitos
- Generación de reportes estándar
- Coding y debugging
- Cotizaciones (cuando scope está claro)
- Diseño UI/UX operacional

**Costo:** Medio  
**Tiempo respuesta:** Equilibrado

---

### 🟡 HAIKU (Velocidad, Tareas Simples)

**Capacidades:**
- Reasoning básico
- Muy rápido
- Tareas bien definidas
- Bajo costo

**Casos de uso:**
- Documentación y manuales
- Checklists
- Tareas de ejecución simple
- Capacitación
- Q&A básicas

**Costo:** Bajo  
**Tiempo respuesta:** Muy rápido

---

## 🎯 AGENTES QUE NECESITAN OPUS

### 1. ARQUITECTO 🟣

**Por qué Opus:**
- Diseñar soluciones = análisis multi-opciones
- Trade-offs: Velocidad vs Mantenibilidad, Costo vs Performance
- Estimaciones deben considerar riesgos
- Propuestas de arquitectura requieren reasoning profundo

**Escenarios Opus:**
```
- "¿Microservicios o Monolito para escalar a 100K usuarios?"
  → Múltiples factores, trade-offs complejos

- "¿PostgreSQL o NoSQL para este dataset?"
  → Análisis de casos de uso, limitations, roadmap

- "¿On-premise o Cloud? ¿Cuáles son riesgos?"
  → Compliance, costo, seguridad, escalabilidad
```

**Beneficio:** Arquitecturas más robustas, estimas más precisas, menos cambios mid-proyecto

---

### 2. SECURITY 🟣

**Por qué Opus:**
- Cumplimiento legal (Ley 19.628, GDPR)
- Análisis de amenazas (requiere pensamiento estratégico)
- Trade-offs seguridad vs usabilidad
- Regulaciones complejas e interpretables

**Escenarios Opus:**
```
- "¿Cumplimos Ley 19.628 con esta arquitectura?"
  → Interpretación legal, análisis detallado

- "¿Qué vulnerabilidades tiene este NDA?"
  → Razonamiento jurídico, precedentes

- "¿Cómo mitigamos riesgo de breach?"
  → Análisis amenaza, diseño defenses
```

**Beneficio:** Cero compliance violations, mejor protección, confianza cliente

---

### 3. PROJECT MANAGER (YO) 🟣

**Por qué Opus:**
- Coordinación multi-agente = problemas complejos
- Mediación de conflictos sin solución simple
- Decisiones estratégicas de negocio
- Escalaciones a Patricio (requieren contexto completo)

**Escenarios Opus:**
```
- "COMERCIAL prometió 6 semanas, ARQUITECTO dice 8, ¿qué hacer?"
  → Múltiples opciones, análisis pros/cons, decisión fundamentada

- "¿Cuándo escalo a Patricio vs resuelvo?"
  → Reasoning sobre importancia, urgencia, estrategia

- "¿Cómo priorizo recursos entre 3 proyectos?"
  → Análisis ROI, riesgos, impacto empresa
```

**Beneficio:** Decisiones mejores, menos escalaciones innecesarias, equipo más alineado

---

### 4. PRODUCT MANAGER 🟣

**Por qué Opus:**
- Análisis de mercado = múltiples variables
- Pricing strategy = trade-offs complejos
- Decisiones de oportunidades nuevas
- Validación financiera con contexto estratégico

**Escenarios Opus:**
```
- "¿Qué precio para Nivel 3? ¿Competitivo?"
  → Análisis mercado, margen, posicionamiento

- "¿Entramos en sector de modelos predicción?"
  → Análisis costo/beneficio, riesgos, roadmap

- "¿Cuál es oportunidad REAL en mercado?"
  → Investigación profunda, insights no obvios
```

**Beneficio:** Precios optimizados, decisiones estratégicas validadas, revenue maximizada

---

### 5. LEGAL 🟣

**Por qué Opus:**
- Interpretación legal (Ley 19.628, GDPR, derecho comercial)
- Redacción contratos (múltiples opciones, cláusulas complejas)
- Análisis de riesgos legales
- Precedentes y jurisprudencia

**Escenarios Opus:**
```
- "¿Esta cláusula es válida en Chile?"
  → Interpretación legal, precedentes

- "¿Cómo proteger IP en contrato con cliente?"
  → Análisis de opciones legales, best practices

- "¿Cuál es riesgo legal de esta operación?"
  → Análisis exhaustivo, mitigaciones
```

**Beneficio:** Contratos más sólidos, riesgo legal minimizado, confianza en documentos

---

## 🎯 AGENTES CON SONNET (Equilibrio)

### 6. DEV 🟢

**Por qué Sonnet:**
- La mayoría de tareas = implementar decisiones ya tomadas
- Debugging = problemática clara
- Integración = tareas bien definidas
- Cuando ARQUITECTO definió, DEV ejecuta

**Escenarios Sonnet:**
```
- "Implementa esta arquitectura en código"
  → Spec clara, ejecución directa

- "¿Por qué este código está lento?"
  → Debugging, profiling, optimización

- "Integra API X con sistema Y"
  → Spec clara, ejecución técnica
```

**Excepción a Opus:**
- Si hay múltiples opciones de implementación
- Si necesita proponer alternativas técnicas
- Si requiere trade-off análisis

---

### 7. QA 🟢

**Por qué Sonnet:**
- Testing = ejecución sistemática
- Validación = checklist claro
- Edge cases = búsqueda estructurada
- Cuando ARQUITECTO definió casos, QA valida

**Escenarios Sonnet:**
```
- "¿Este sistema está listo para producción?"
  → Validación contra checklist

- "Encuentra edge cases en esta lógica"
  → Testing sistemático

- "¿Qué test cases necesitamos?"
  → Cobertura basada en spec
```

**Excepción a Opus:**
- Si hay casos complejos de testing estratégico
- Si necesita proponer estrategia QA para proyecto grande
- Si requiere análisis de riesgos de quality

---

### 8. COMERCIAL 🟢

**Por qué Sonnet:**
- Cuando scope está claro = ejecutar
- Cotizaciones = aplicar política + tomar números
- Propuestas = format + información
- Cuando ARQUITECTO + DEV + QA dieron estimas, COMERCIAL arma cotización

**Escenarios Sonnet:**
```
- "Prepara cotización para cliente X"
  → Datos dados, formato claro

- "Redacta propuesta comercial"
  → Template + información, ejecución

- "¿Cómo presento este precio al cliente?"
  → Habilidad comercial, no reasoning extremo
```

**Excepción a Opus:**
- Si necesita negociar términos complejos
- Si hay múltiples opciones de empaque
- Si requiere análisis de posición negociadora

---

### 9. FINANCE 🟢

**Por qué Sonnet:**
- Cálculos = matemática clara
- Reportes = datos + formato
- Presupuestos = aplicar política + proyección
- Cuando POLÍTICA FINANCIERA está definida, FINANCE ejecuta

**Escenarios Sonnet:**
```
- "Calcula margen proyecto X"
  → Fórmula, datos, ejecución

- "Prepara P&L mensual"
  → Datos + formato, ejecución

- "¿Cuál es prorrateo costos fijos?"
  → Algoritmo claro, ejecución
```

**Excepción a Opus:**
- Si requiere análisis estratégico de pricing
- Si hay variables complejas en presupuesto
- Si necesita modelar escenarios múltiples

---

### 10. UI/UX 🟢

**Por qué Sonnet:**
- Diseño = criterios claros
- Evaluación = matriz scoring (cuantitativa)
- Propuestas = formato, no razonamiento extremo
- Cuando estrategia está clara, UX diseña/evalúa

**Escenarios Sonnet:**
```
- "Diseña interface para este flujo"
  → Requisitos claros, creatividad + usabilidad

- "¿Esta interface es usable?"
  → Evalúa contra criteria, propone mejoras

- "¿Cuál es viaje cliente aquí?"
  → Mapping, no reasoning extremo
```

**Excepción a Opus:**
- Si hay decisión estratégica sobre UX
- Si requiere análisis profundo de experiencia
- Si hay trade-offs complejos (belleza vs usabilidad)

---

## 🟡 AGENTES CON HAIKU (Velocidad)

### 11. DELIVERY 🟡

**Por qué Haiku:**
- Capacitación = documentación clara
- Go-live = checklist ejecución
- Soporte = troubleshooting sistemático
- Tareas bien definidas, bajo reasoning

**Escenarios Haiku:**
```
- "Prepara manual de capacitación"
  → Información → Documento, no reasoning

- "¿Checklist go-live?"
  → Items, validación, formato

- "Cliente tiene problema con feature X"
  → Troubleshooting, ejecución
```

---

## 💰 IMPACTO FINANCIERO

**Costo relativo por modelo:**

```
HAIKU:     1 unidad costo
SONNET:    3 unidades costo
OPUS:      5-7 unidades costo (extended thinking)

EJEMPLO INVERSIÓN:
- 5 Opus agents × $X/mes = $5X
- 4 Sonnet agents × $Y/mes = $4Y
- 2 Haiku agents × $Z/mes = $2Z
─────────────────────────────
Total: Optimizado para ROI
```

---

## 🚀 RECOMENDACIONES IMPLEMENTACIÓN

### INICIO (Mes 1)

```
Usar Opus para:
✅ ARQUITECTO (diseño soluciones)
✅ SECURITY (compliance)
✅ PROJECT MANAGER (yo - coordinación)
✅ PRODUCT MANAGER (mercado)

Usar Sonnet para:
✅ DEV, QA, COMERCIAL, FINANCE, UI/UX

Usar Haiku para:
✅ DELIVERY (capacitación, checklists)
```

### ESCALADO (Mes 3+)

```
Revisar uso real:
├─ ¿Sonnet suficiente para DEV?
├─ ¿Opus necesario para COMERCIAL?
├─ ¿Haiku funciona para otros?
└─ Optimizar costo/calidad basado en resultados

Posible ajuste:
- DEV a Opus si proyectos muy complejos
- COMERCIAL a Opus si negocios estratégicos
- FINANCE a Opus si análisis presupuestal complejo
```

---

## 📋 CHECKLIST: ¿CUÁNDO ESCALAR A OPUS?

**Un agente necesita Opus cuando:**

```
□ Tareas requieren reasoning multi-paso
□ Hay múltiples opciones válidas con trade-offs
□ Decisión tiene alto impacto ($$ o estrategia)
□ Requiere análisis de precedentes/contexto
□ Necesita síntesis compleja de información
□ Interpretación de ambigüedades necesaria
□ Medición de riesgos/oportunidades requerida

Si 3+ SÍ → Considera Opus
Si 5+ SÍ → Recomienda Opus
```

---

## ✅ CONCLUSIÓN

```
OPTIMIZACIÓN CONSULTORAVIRTUAL:

Opus (Reasoning Profundo):
- ARQUITECTO (diseño)
- SECURITY (compliance)
- PROJECT MANAGER (coordinación)
- PRODUCT MANAGER (estrategia)
→ Impacto: Decisiones mejores, riesgos minimizados

Sonnet (Equilibrio):
- DEV, QA, COMERCIAL, FINANCE, UI/UX
→ Impacto: Ejecución rápida, calidad buena, costo optimizado

Haiku (Velocidad):
- DELIVERY
→ Impacto: Eficiencia, bajo costo, tareas operacionales

RESULTADO:
✅ Máxima calidad donde importa
✅ Velocidad en ejecución
✅ Costo optimizado
✅ Escalabilidad viable
```

---

**Si tienes dudas sobre un agente específico, avísame.**  
*El poder computacional está donde genera más valor.*
