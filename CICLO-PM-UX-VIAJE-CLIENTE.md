# 🎯 CICLO: PRODUCT MANAGER + UI/UX VALIDA VIAJE DEL CLIENTE

**Responsables:** PRODUCT MANAGER + UI/UX  
**Cuándo aplica:** Toda oportunidad nueva, toda cotización  
**Objetivo:** Asegurar que la experiencia del cliente sea atractiva y viable  

---

## 🔄 FLUJO INTEGRADO: PM ↔ UX

```
COMERCIAL prepara COTIZACIÓN
        │
        ▼
PRODUCT MANAGER valida FINANCIERO
  ├─ ¿Margen OK?
  ├─ ¿Cash flow OK?
  └─ ¿Presupuesto mes OK?
        │
        ├─ SÍ ✅
        │  ↓
        │  Escala a UI/UX
        │  "¿Viaje cliente OK?"
        │
        └─ NO ❌ → Rechaza
        
        ▼
UI/UX valida EXPERIENCIA
  ├─ ¿Interface intuitiva?
  ├─ ¿Solución atractiva?
  ├─ ¿Delivery genera valor?
  └─ ¿Puede mejorar UX?"
        │
        ├─ SÍ EXCELENTE ✅✅
        │  ↓ → ADELANTE
        │
        ├─ SÍ OK (pero mejorable)
        │  ↓ → Propone mejoras a COMERCIAL
        │  ↓ → PM renegocia scope/precio
        │  ↓ → ADELANTE (mejorado)
        │
        └─ NO ATRACTIVA ❌
           ↓ → Rechaza o propone rediseño

        ▼
PRODUCT MANAGER FINAL OK
  ├─ Financiero ✅
  ├─ UX ✅
  └─ Propuesta lista → COMERCIAL
```

---

## 📋 PASO 1: PRODUCT MANAGER VALIDA FINANCIERO

**Responsable:** PRODUCT MANAGER  
**Checklist:**

```
□ Margen proyecto >= 40%? (Ley POLÍTICA FINANCIERA)
□ Margen empresa mes >= 30%?
□ Cash flow viable? (cliente paga 50% firma)
□ Presupuesto del mes tiene espacio?
□ Oportunidad estratégica?

SI todos SÍ → Avanza a UX
SI alguno NO → Rechaza cotización
```

---

## 🎨 PASO 2: UI/UX VALIDA EXPERIENCIA DEL CLIENTE

**Responsable:** Agente UI/UX  
**Input de:** COMERCIAL (cotización + alcance)

### 2A: MAPEO DEL VIAJE

**Preguntas que UI/UX debe responder:**

```
1. ¿QUIÉN es el cliente?
   - Persona: [nombre/rol]
   - Pain points: [qué sufre]
   - Necesidades: [qué quiere]

2. ¿CUÁL es el viaje actual?
   - Paso 1: [Estado A]
   - Paso 2: [Acción intermedia]
   - Paso 3: [Estado B deseado]

3. ¿QUÉ MEJORA nuestra solución?
   - Eficiencia: ¿Más rápido?
   - Usabilidad: ¿Más fácil?
   - Valor: ¿Más dinero/datos/insights?

4. ¿CÓMO la presentamos?
   - Interface: ¿Intuitiva?
   - Onboarding: ¿Claro?
   - Soporte: ¿Accesible?
```

### 2B: EVALUACIÓN DE ATRACTIVO

**Matriz de decisión:**

| Aspecto | Excelente | Bueno | Mejorable | Malo |
|---------|-----------|-------|-----------|------|
| **Valor percibido** | Muy claro | Claro | Confuso | Ninguno |
| **Facilidad uso** | Intuitivísima | Fácil | Normal | Difícil |
| **Diferencial** | Único | Ventaja | Me iguala | Perdemos |
| **Implementación** | Ejecutable | Viable | Desafiante | Imposible |
| **Timeline** | Rápido | Normal | Largo | Crisis |

**Scoring:**
```
Excelente (4) = Adelante
Bueno (3) = Mejorable pero OK
Mejorable (2) = Requiere rediseño
Malo (1) = Rechazar
```

**Umbral:**
- Score >= 12: **ADELANTE ✅**
- Score 8-11: **MEJORABLE** (propone cambios)
- Score < 8: **RECHAZAR o REDISEÑAR ❌**

### 2C: EJEMPLOS DE DECISIÓN

#### Ejemplo 1: ADELANTE (Score 15)

```
PROYECTO: Diagnóstico Madurez (Cliente SME)

VIAJE CLIENTE:
1. Hoy: SME no sabe dónde está en madurez operacional
2. Mi solución: Test interactivo (MMA-OD) 
3. Futuro: SME entiende fortalezas + brechas

EVALUACIÓN:
- Valor percibido: ✅ Excelente (diagnóstico único)
- Facilidad: ✅ Excelente (7 preguntas, 5 minutos)
- Diferencial: ✅ Excelente (nadie más mide "Orden/Datos" así)
- Implementación: ✅ Excelente (ya existe, solo adaptar)
- Timeline: ✅ Excelente (2 semanas)
Score: 4 + 4 + 4 + 4 + 4 = 20 / 20

→ UI/UX: "✅ ADELANTE. Experiencia clara, valor evidente, cliente va a amarlo"
```

#### Ejemplo 2: MEJORABLE (Score 9 → Optimizado a 14)

```
PROYECTO: AutoML para Retail (Predicción demanda)

VIAJE CLIENTE:
1. Hoy: Planificador ordena por intuición
2. Mi solución: AutoML predice demanda
3. Futuro: Stock optimizado, 15% menos desperdicio

EVALUACIÓN INICIAL:
- Valor percibido: Mejorable (confuso cómo funciona ML)
- Facilidad: Mejorable (interface técnica, no para retail)
- Diferencial: Bueno (algunos competidores)
- Implementación: Bueno
- Timeline: Bueno
Score inicial: 2 + 2 + 3 + 3 + 3 = 13

UI/UX PROPONE MEJORAS:
1. "Simplifiquemos interface: 3 tabs (Upload → Predic → Plan)"
2. "Traducir jargón ML a lenguaje retail (no 'features', sí 'factores')"
3. "Dashboard visual (gráfico demanda vs predicción)"
4. "Reporte simplificado: Top 5 cambios recomendados"

NUEVA EVALUACIÓN:
- Valor percibido: Bueno → Excelente (ahora es claro)
- Facilidad: Mejorable → Bueno (interface rediseñada)
- Diferencial: Bueno (mantiene)
- Implementación: Bueno (+ 1 semana rediseño)
- Timeline: Bueno (ahora 5 semanas)
Score nuevo: 4 + 3 + 3 + 3 + 3 = 16

→ UI/UX: "✅ MEJORABLE PERO OK. Necesita UX rediseño (+$2K) pero viaja es más atractivo"
→ PRODUCT MANAGER: "Renegocio scope con cliente. +$2K para UX = $10K total, margen 50% OK"
```

#### Ejemplo 3: RECHAZAR (Score 5)

```
PROYECTO: Sistema RRHH para StartUp (Contratos digitales)

VIAJE CLIENTE:
1. Hoy: Excel + email para gestionar contratos
2. Mi solución: Sistema RRHH enterprise (SAP-like)
3. Futuro: Contratos digitales

EVALUACIÓN:
- Valor percibido: Malo (StarUp no necesita 80% features)
- Facilidad: Malo (SAP es complejo, StartUp quiere simple)
- Diferencial: Bueno (es SAP)
- Implementación: Malo (12 semanas, muy larga)
- Timeline: Malo (StartUp necesita en 4 semanas)
Score: 1 + 1 + 3 + 1 + 1 = 7

→ UI/UX: "❌ RECHAZAR. Overkill. Cliente necesita SaaS simple (Rippling/Bamboo),
   no sistema enterprise. Experiencia va a ser frustración."
→ PRODUCT MANAGER: "Rechazamos. No es buen fit cliente."
```

---

## 🔄 PASO 3: FEEDBACK UX → COMERCIAL → PM (Ciclo)

### Si UX dice "Mejorable":

```
UI/UX → COMERCIAL:
"Propuesta necesita mejoras UX:
 - Rediseño interface (+$2K, +1 semana)
 - Traducir lenguaje técnico
 - Simplificar dashboard
¿Podemos incluir esto en scope?"

COMERCIAL → CLIENTE:
"Para maximizar valor, recomendamos incluir:
 - Dashboard visual (mejor decisiones)
 - Onboarding simplificado (faster time-to-value)
 - Soporte prioritario (3 meses)
Costo adicional: $2K, Timeline +1 semana"

CLIENTE: "SÍ, mejorado"

COMERCIAL → PRODUCT MANAGER:
"Renegoció. Ahora $10K (fue $8K)
¿OK margen + UX?"

PRODUCT MANAGER:
"Nuevo precio $10K, costo $4.5K (asume rediseño UX)
Margen 55% ✅ OK"

→ ADELANTE con mejoras
```

### Si UX dice "Rechazar":

```
UI/UX → PRODUCT MANAGER:
"❌ RECHAZAR. Score 5. Overkill para cliente.
 Recomendación: Que busque SaaS simple (no custom)"

PRODUCT MANAGER → COMERCIAL:
"Rechazamos propuesta. No buen fit UX/comercial.
Mejor recomendar alternativa: Rippling (SaaS $150/mes)"

COMERCIAL → CLIENTE:
"Después de evaluación, recomendamos usar SaaS existente
(más rápido, más barato, mejor UX para StartUp)
Oferta: Te asesoramos implementación Rippling por $2K"

CLIENTE: "OK, hace sentido"
```

---

## 📊 MATRIZ DE DECISIÓN FINAL

Cuando PM + UX conversan:

| Financiero | UX | Decisión | Acción |
|------------|----|----------|--------|
| ✅ OK | ✅ Excelente | ✅ ADELANTE | Cotización → Cliente |
| ✅ OK | ✅ Mejorable | ✅ MEJORABLE | Propone mejoras a cliente |
| ✅ OK | ❌ Rechazar | ❌ RECHAZAR | Alterna o rechaza |
| ❌ NO | ✅ Excelente | ❌ RECHAZAR | Renegocia precio (raro) |
| ❌ NO | ✅ Mejorable | ❌ RECHAZAR | Rechaza |
| ❌ NO | ❌ Rechazar | ❌ RECHAZAR | Rechaza definitivo |

---

## 💬 CONVERSACIÓN PM + UX

**PM llama a UX:**

```
PM: "Nueva propuesta: Diagnóstico Madurez para Clínica.
    $8K, 4 semanas, margen 50%.
    ¿Qué piensa UX de viaje cliente?"

UX: "¿Quién es cliente y qué quiere?"

PM: "Clínica (50 camas). Quiere entender madurez operacional.
    Diagnosticar fortalezas/brechas en Orden/Datos."

UX: "✅ Claro. Score evaluación:
    - Valor: 4 (diagnóstico único)
    - Facilidad: 4 (test 5 min)
    - Diferencial: 4 (somos únicos)
    - Implementación: 4 (ready)
    - Timeline: 4 (2 semanas)
    Score total: 20/20
    
    ADELANTE. Cliente va a AMAR."

PM: "✅ Financiero OK, UX OK. COMERCIAL puede vender."
```

---

## 🎯 RESPONSABILIDADES

### PRODUCT MANAGER
- Valida FINANCIERO (checklist POLÍTICA FINANCIERA)
- Escala a UX si financiero OK
- Recibe score UX
- Renegocia con COMERCIAL si UX pide mejoras
- Toma decisión FINAL (OK / Mejorable / Rechazar)

### UI/UX
- Evalúa EXPERIENCIA del cliente
- Mapea viaje cliente
- Propone mejoras si es mejorable
- Rechaza si no vale la pena
- Score honest (no politiquería)

### COMERCIAL
- Escucha feedback PM + UX
- Si "Mejorable": propone mejoras a cliente
- Si "Rechazar": ofrece alternativa
- Mantiene alineado todo

---

## ✅ CHECKLIST PM + UX

### Antes de validar "OK":

```
PRODUCT MANAGER:
□ Margen financiero OK?
□ Cash flow OK?
□ Presupuesto OK?
□ UX evaluó experiencia?

UI/UX:
□ Mapeo viaje cliente claro?
□ Evaluación score completa?
□ Propuestas mejoras específicas?
□ Recomendación clara (OK/Mejorable/Rechazar)?
```

### Después de decisión:

```
□ COMERCIAL informado (OK/Mejorable/Rechazar)
□ Si mejoras: cliente notificado
□ Si rechazo: cliente ofrecido alternativa
□ ARQUITECTO listo (si adelante)
□ PROYECTO inicia (si firma)
```

---

*Este ciclo asegura que NO vendemos soluciones que no van a gustar*  
*PM + UX es la "puerta de calidad" antes de vender*  
*Si UX dice NO, es NO. Sin excepciones.*
