# ✅ CHECKLIST: PRODUCT MANAGER VALIDA CONTRA POLÍTICA FINANCIERA

**Responsable:** PRODUCT MANAGER  
**Cuándo aplica:** Toda cotización, toda oportunidad nueva  
**Requiere:** POLÍTICA_FINANCIERA.md + DASHBOARD CASH FLOW actual  

---

## 🚫 ANTES DE VALIDAR "OK" A COMERCIAL

### PASO 1: Margen Mínimo

```
□ ¿Precio >= Costo × (1 / (1 - Margen Mínimo))?

Ejemplo Nivel 2 ($5K):
- Costo estimado: $2.5K (50%)
- Margen mínimo: 40%
- Precio mínimo: $2.5K / (1 - 0.40) = $4.166K
- ¿$5K >= $4.166K? ✅ OK

Fórmula por Nivel:
- Nivel 1: $2K mínimo (50% margen)
- Nivel 2: $5K mínimo (40% margen)
- Nivel 3: $8K mínimo (40% margen)
- Nivel 4: $15K mínimo (50% margen)
- Nivel 5: $25K/año mínimo (50% margen)
```

**Si NO cumple:** ❌ Rechazar o renegociar precio

---

### PASO 2: Margen Empresarial

```
□ ¿Margen empresa este mes seguirá siendo >= 30%?

Fórmula:
Margen mes = (Ingresos totales mes - Costos totales) / Ingresos totales × 100

Ejemplo:
- Ingresos confirmados mes: $8K
- Proyecto nuevo: +$5K = $13K
- Costos fijos: $300
- Margen nuevo: ($13K - $300) / $13K = 97.7% ✅
- ¿97.7% >= 30%? ✅ OK
```

**Si NO cumple:** ❌ Rechazar o pedir aumento presupuesto

---

### PASO 3: Cash Flow Viable

```
□ ¿Tenemos cash para esperar pago?

Ciclo típico:
- Firma contrato: Cliente paga 50%
- Hito 2 (semana 4): Cliente paga 30%
- Go-live (semana 8): Cliente paga 20%

Pregunta crítica:
"¿Si cliente no paga hasta semana 4, tenemos $[Costo] en caja?"

Ejemplo Nivel 3 ($8K):
- Costo: $4K
- Flujo: 50% ($4K) hoy, 30% ($2.4K) semana 4
- ¿Tenemos $4K en caja HOY? ✅ OK
- ¿O esperar pago hasta semana 4 nos deja < $5K? ❌ NO
```

**Si NO cumple:** ⚠️ Pedir 100% anticipado O rechazar

---

### PASO 4: Presupuesto del Mes

```
□ ¿Hay espacio en presupuesto del mes?

Revisar:
- Presupuesto mes: $X (aprobado por Patricio)
- Gasto confirmado YA: $Y
- Espacio disponible: $X - $Y
- ¿Proyecto nuevo ($Z) cabe en espacio?

Ejemplo:
- Presupuesto julio: $50K
- Proyectos ya confirmados: $35K
- Espacio: $15K
- Proyecto nuevo: $8K
- ¿$8K <= $15K? ✅ OK
```

**Si NO cumple:** ⏳ Posponer a mes siguiente O escalar a Patricio

---

### PASO 5: Oportunidad Estratégica

```
□ ¿Align con visión futura?

Preguntas:
- ¿Es cliente referenciable? (case study?)
- ¿Es escalable a otros clientes?
- ¿Es entrada a nuevo mercado?
- ¿Aprovecha nueva capacidad (ej: modelos predicción)?

Ejemplo:
- Proyecto CEAPSI (clínica): Es escalable a otras clínicas ✅
- Proyecto XYZ (retail): Es escalable a otros retailers ✅
- Proyecto DEMO (testing): No es escalable ⚠️ (solo por learning)
```

**Si NO cumple:** ⚠️ Solo si margen >> 50% (justifica inversión en learning)

---

## 📋 FORMATO DE VALIDACIÓN

**Cuando COMERCIAL dice:** "Cotización $[X] para [Cliente]"

**Tú (PRODUCT MANAGER) responde:**

```
✅ VALIDADO - OK proceder

Margen proyecto: XX% (min 30% ✅)
Margen empresa mes: XX% (min 30% ✅)
Cash flow: [Cliente paga 50% hoy = $Y en caja] ✅
Presupuesto mes: Espacio disponible $Z ✅
Estrategia: [Explicar si es escalable/referenciable]

Recomendación: ADELANTE
```

O:

```
❌ RECHAZAR - No cumple política

Margen proyecto: XX% (mínimo 30% ❌ - renegociar a $X mínimo)
O
Cash flow: [Cliente no paga hasta semana 4, saldo sería $Y < $5K] ❌ - pedir 100% anticipado
O
Presupuesto: [Mes lleno, espacio 0] ❌ - posponer a mes siguiente

Recomendación: RECHAZAR o RENEGOCIAR
```

---

## 💬 EJEMPLOS

### Ejemplo 1: ACEPTAR

```
COMERCIAL: "Cotización Level 2 ($5K) para ACME, semana 8"

PRODUCT MANAGER validación:
□ Margen: $5K × 40% = $2K ✅ (mínimo $3.33K para 40% margen)
  CORRECCIÓN: Margen = ($5K - $2.5K) / $5K = 50% ✅✅

□ Cash empresa: $8K + $5K = $13K ingresos, costos $300 = 97% margen ✅

□ Cash flow: Paga 50% hoy = $2.5K recibimos HOY, $4K en caja OK ✅

□ Presupuesto: Julio $50K, confirmado $35K, espacio $15K, $5K OK ✅

□ Estrategia: Clínica = escalable a otras clínicas ✅

→ RESPUESTA: "✅ OK. Margen 50%, empresarial 97%, cash OK, dentro presupuesto. ADELANTE"
```

### Ejemplo 2: RECHAZAR (Margen bajo)

```
COMERCIAL: "Cotización Level 2 ($3.5K) para STARTUP XYZ"

PRODUCT MANAGER validación:
□ Margen: ($3.5K - $2.5K) / $3.5K = 28.6% ❌ (mínimo 40%)

→ RESPUESTA: "❌ RECHAZAR. Margen 28.6% < 40% mínimo. Renegociar a mínimo $4.166K (50% margen)"
```

### Ejemplo 3: RECHAZAR (Presupuesto lleno)

```
COMERCIAL: "Cotización Level 3 ($8K) para NEW CORP, agosto"

PRODUCT MANAGER validación:
□ Presupuesto agosto: $50K
□ Confirmado ya: $48K (ACME $5K, XYZ $3K, DEMO $40K para integración)
□ Espacio disponible: $2K
□ ¿$8K <= $2K? ❌ NO

→ RESPUESTA: "❌ RECHAZAR este mes. Presupuesto agosto lleno ($48K/$50K). Proponer para septiembre o escalar a Patricio si urgente"
```

### Ejemplo 4: ESCALAR A PATRICIO (Oportunidad especial)

```
COMERCIAL: "Cotización Level 4 ($20K) para TELCO GIGANTE, urgente"

PRODUCT MANAGER validación:
□ Margen: ($20K - $8K) / $20K = 60% ✅ (mínimo 50%)
□ Cash empresa: OK ✅
□ Presupuesto agosto: LLENO ❌

PERO:
- TELCO GIGANTE es estratégico (referencia HUGE)
- $20K margen = $12K neto (importante)
- Podría ser entrada a sector telecomunicaciones

→ RESPUESTA: "⚠️ ESCALAR a Patricio. Margen OK (60%), presupuesto lleno PERO oportunidad estratégica (TELCO + mercado nuevo). Patricio decide si autoriza ampliación presupuesto."
```

---

## 🚨 AUTORIDADES

| Decisión | PRODUCT MANAGER | PATRICIO |
|----------|-----------------|----------|
| OK proyecto dentro política | ✅ Decide | - |
| Rechazar proyecto (no cumple) | ✅ Decide | - |
| Aceptar proyecto FUERA presupuesto | ❌ Escalar | ✅ Decide |
| Aceptar proyecto margen BAJO (especial) | ❌ Escalar | ✅ Decide |
| Aceptar proyecto riesgo CASH alto | ❌ Escalar | ✅ Decide |

---

## 📊 DASHBOARD QUE NECESITAS

Actualizado DIARIAMENTE:

```
CASH FLOW ACTUAL
├─ Saldo hoy: $X
├─ Ingresos próximos 30 días: $Y
├─ Egresos próximos 30 días: $Z
└─ Proyectado fin mes: $X + $Y - $Z

PRESUPUESTO MES ACTUAL
├─ Total aprobado: $A
├─ Confirmado ya: $B
├─ Espacio disponible: $A - $B
└─ % utilización: ($B / $A) × 100

MARGEN EMPRESA
├─ Ingresos mes confirmado: $P
├─ Costos mes: $Q
├─ Margen: ($P - $Q) / $P
└─ Status: ✅ OK / ⚠️ Alert / ❌ BAJO
```

**Acceso:** FINANCE mantiene, PM revisa diariamente antes de validar

---

## ✅ RESPONSABILIDADES PRODUCT MANAGER

1. **Revisar diariamente** dashboard FINANCE
2. **Validar cada cotización** contra POLÍTICA FINANCIERA
3. **Rechazar** si no cumple mínimos
4. **Escalar a Patricio** si es especial
5. **Nunca aprobas** sin validar números

---

*Este checklist es NO NEGOCIABLE*  
*Cada PM debe validar, cada Patricio debe estar consciente*  
*Sin este control: empresa pierde dinero*
