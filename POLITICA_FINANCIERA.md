# 💰 POLÍTICA FINANCIERA - CONSULTORAVIRTUAL

**Versión:** 1.0  
**Efectiva:** 2026-07-27  
**Responsable:** Agente FINANCE/CFO  
**Aprueba:** Patricio Ferrer  

---

## 1. DEFINICIÓN DE MÁRGENES

### Margen por Nivel de Servicio

```
NIVEL 1: IA Básica ($2K)
├─ Costo: $1K (50%)
├─ Margen: $1K (50%)
└─ Margen % mínimo: 45%

NIVEL 2: IA Avanzada ($5K)
├─ Costo: $2.5K (50%)
├─ Margen: $2.5K (50%)
└─ Margen % mínimo: 40%

NIVEL 3: AutoML ($8K)
├─ Costo: $4K (50%)
├─ Margen: $4K (50%)
└─ Margen % mínimo: 40%

NIVEL 4: IA en Vivo ($15K)
├─ Costo: $6K (40%)
├─ Margen: $9K (60%)
└─ Margen % mínimo: 50%

NIVEL 5: Closed-Loop ($25K/año)
├─ Costo: $10K (40%)
├─ Margen: $15K (60%)
└─ Margen % mínimo: 50%
```

### Margen Empresarial MÍNIMO

- **Por Proyecto:** Mínimo 40%
- **Por Mes:** Mínimo 35%
- **Anual:** Mínimo 30% (después de costos operacionales)

**Alert:** Si margen < 30%, escalar a PRODUCT MANAGER + PATRICIO

---

## 2. CICLOS DE PAGO - CLIENTES

### Modelo de Pago Estándar

```
HITO 1: Firma Contrato
└─ CLIENTE paga: 50%
└─ Plazo: Previo a inicio

HITO 2: MVP/Demostrable
└─ CLIENTE paga: 30%
└─ Plazo: Dentro de 15 días de demostrable

HITO 3: Go-Live/Final
└─ CLIENTE paga: 20%
└─ Plazo: Dentro de 10 días de go-live
```

### Términos de Pago

- **Contado:** 50% inicio, 50% final (ideal)
- **A Plazos:** 50%-30%-20% (estándar)
- **30 días:** Solo con clientes conocidos/referencias
- **60 días:** Solo autorizado por PATRICIO

**Plazo máximo permitido:** 60 días  
**Alert si:** Cliente se atrasa > 15 días

---

## 3. CICLOS DE PAGO - PROVEEDORES

### Suscripciones Mensuales (Cloud)

```
PROVEEDOR          | COSTO APROX  | CICLO    | PAGO
───────────────────┼──────────────┼──────────┼─────
Supabase           | $50-200      | Mensual  | Auto
Vercel             | $20-100      | Mensual  | Auto
Upstash Redis      | $0-50        | Mensual  | Auto
Hugging Face       | $0-50        | Mensual  | Auto (si aplica)
GitHub Enterprise  | $21          | Mensual  | Auto (si aplica)
───────────────────┼──────────────┼──────────┼─────
TOTAL SUSCRIPCIONES| $140-420     | Mensual  | Automático
```

### Costos Variables (Si Aplica)

- **Data Science consultores** (external): Según contrato
- **Capacitación clientes**: Según scope
- **Infraestructura especial**: Por proyecto

---

## 4. PRORRATEO DE COSTOS

### Filosofía

"Los costos fijos se prorratean entre todos los proyectos activos en ese mes."

### Método de Prorrateo

```
PASO 1: Calcular costo total fijo del mes
  Total = Supabase + Vercel + Upstash + GitHub + etc.
  Ejemplo: $250/mes

PASO 2: Identificar proyectos activos ese mes
  Activos = tiene trabajo en progreso
  Ejemplo: 3 proyectos (ACME, XYZ, DEMO)

PASO 3: Prorratear costo
  Costo por proyecto = Total / Nº proyectos
  Ejemplo: $250 / 3 = $83.33 por proyecto

PASO 4: Restar del ingreso esperado
  Ingreso neto = Ingreso - prorrateo
  Ejemplo: $5000 - $83.33 = $4916.67
```

### Alternativa: Por Uso Proporcional

Si ciertos proyectos usan MÁS recursos (DB storage, API calls):

```
PASO 1: Medir uso real
  ACME: 50% del uso total
  XYZ: 30% del uso total
  DEMO: 20% del uso total

PASO 2: Prorratear según uso
  ACME: $250 × 50% = $125
  XYZ: $250 × 30% = $75
  DEMO: $250 × 20% = $50

PASO 3: Restar del ingreso
  ACME neto: $5000 - $125 = $4875
  XYZ neto: $3000 - $75 = $2925
  DEMO neto: $1000 - $50 = $950
```

**Usar método:** Alternativa (por uso) si datos disponibles  
**Default:** Método simple (división igual) si no hay datos

---

## 5. PRESUPUESTO MENSUAL

### Estructura

```
INGRESOS (Esperados)
├─ Proyectos en ejecución: $X
├─ Proyectos nuevos (hitos pago): $Y
└─ Total esperado: $X + $Y

EGRESOS (Proyectados)
├─ Costos fijos (suscripciones): $A
├─ Costos variables (consultores): $B
├─ Otros operacionales: $C
└─ Total esperado: $A + $B + $C

MARGEN ESPERADO
├─ Margen = Ingresos - Egresos
├─ Margen % = (Margen / Ingresos) × 100
└─ OK si: Margen % > 30%
```

### Frecuencia

- **Presupuesto próximo mes:** Último viernes de mes actual
- **Revisión:** Primer viernes del mes
- **Ajustes:** Si hay cambio > 15% en ingresos

### Responsable

- **FINANCE:** Prepara presupuesto
- **PRODUCT MANAGER:** Valida ingresos proyectados
- **PROJECT MANAGER (yo):** Valida costos de ejecución
- **PATRICIO:** Aprueba presupuesto

---

## 6. REPORTES MENSUALES

### P&L Mensual (Profit & Loss)

**Entrega:** Primer 5 del mes siguiente

```
CONSULTORAVIRTUAL - P&L Mensual [MES/YYYY]

INGRESOS
├─ Proyecto ACME: $5,000
├─ Proyecto XYZ: $3,000
└─ Total Ingresos: $8,000

COSTOS
├─ Supabase (prorrateo): $83
├─ Vercel (prorrateo): $33
├─ Upstash (prorrateo): $17
├─ Consultores externos: $0
└─ Total Costos: $133

MARGEN
├─ Margen bruto: $7,867
├─ Margen %: 98.3%
└─ Status: ✅ SALUDABLE

RENTABILIDAD POR PROYECTO
├─ ACME: $5,000 - $83 = $4,917 (98.3%)
├─ XYZ: $3,000 - $50 = $2,950 (98.3%)
└─ DEMO: $0 - $0 = $0 (pendiente)

OBSERVACIONES
├─ Flujo de caja OK
├─ Proyectos en marcha
└─ Próximo hito: ACME 30% (semana 3)
```

### Cash Flow Mensual

**Entrega:** Diariamente (actualizado)

```
CASH FLOW - [MES/YYYY]

SALDO INICIAL: $[X]

INGRESOS RECIBIDOS
├─ ACME (50% firma): $2,500
├─ XYZ (pago hito): $900
└─ Subtotal: $3,400

EGRESOS PAGADOS
├─ Supabase: -$150
├─ Vercel: -$50
├─ Upstash: -$20
└─ Subtotal: -$220

SALDO FIN DE MES: $[X + 3,400 - 220]

PROYECCIÓN PRÓXIMO MES
├─ Ingresos esperados: +$5,000
├─ Egresos esperados: -$200
└─ Saldo estimado: [proyectado]

ALERTAS
└─ Si saldo < $5,000: Escalar a PATRICIO
```

---

## 7. REPORTES YTD (Year-to-Date)

### Métrica Clave: Acumulado Anual

**Entrega:** Mensual (se actualiza cada mes)

```
CONSULTORAVIRTUAL - YTD [AÑO]

ENERO-JULIO 2026 (7 meses)

INGRESOS ACUMULADOS
├─ Total: $120,000
├─ Promedio mensual: $17,143
├─ Tendencia: ↑ (creciendo)

COSTOS ACUMULADOS
├─ Total: $25,000
├─ Promedio mensual: $3,571
├─ Prorrateo total: $2,500

MARGEN ACUMULADO
├─ Total: $95,000
├─ Margen %: 79.2%
├─ Target: 30% (superado 149%)
└─ Status: ✅ EXCELENTE

RENTABILIDAD POR PROYECTO
├─ ACME: $50,000 revenue, 75% margen
├─ XYZ: $40,000 revenue, 85% margen
├─ DEMO: $20,000 revenue, 70% margen
├─ OTROS: $10,000 revenue, 60% margen
└─ Total YTD: $120,000

PROYECCIÓN ANUAL (12 meses)
├─ Si se mantiene ritmo: $205,714
├─ Margen esperado: 79%
├─ Rentabilidad: Muy saludable
└─ Forecast: En línea

HITOS ALCANZADOS
├─ Breakeven: Mes 2
├─ Rentabilidad 50%+: Mes 3
├─ Rentabilidad 70%+: Mes 4
└─ Tendencia: Positiva

COMPARACIÓN vs BUDGET
├─ Ingresos YTD: $120K vs $115K budget = +4.3% ✅
├─ Costos YTD: $25K vs $30K budget = -16.7% ✅
├─ Margen YTD: $95K vs $85K budget = +11.8% ✅

PRÓXIMOS MESES
├─ Agosto: 2 nuevos proyectos proyectados → +$18K
├─ Septiembre: Continuidad ACME + XYZ → $12K
└─ Proyección Q3: +$50K → Total año +$270K
```

---

## 8. ALERTAS Y ESCALACIONES

### Escalar INMEDIATAMENTE si:

```
🚨 CRÍTICO
├─ Saldo de caja < $5,000
├─ Cliente se atrasa > 30 días
├─ Margen mes < 20%
└─ Ingreso proyectado cae > 30% vs mes anterior

⚠️  ALTO
├─ Saldo de caja $5K-$10K
├─ Cliente se atrasa > 15 días
├─ Margen mes 20-30%
└─ Ingreso proyectado cae 15-30%

ℹ️ INFORMATIVO
├─ Nuevo proyecto listo para facturar
├─ Cliente anuncia expansión de scope
├─ Oportunidad de venta cruzada
└─ Tendencia positiva (margen mejora)
```

---

## 9. RECONCILIACIÓN MENSUAL

### Checklist FINANCE

```
□ Ingresos: ¿Coinciden con contratos firmados?
□ Egresos: ¿Coinciden con facturas recibidas?
□ Cuentas por cobrar: ¿Actualizado?
□ Cuentas por pagar: ¿Pagadas a tiempo?
□ Prorrateo: ¿Calculado correctamente?
□ Margen: ¿Por encima del mínimo 30%?
□ Cash flow: ¿Positivo?
```

---

## 10. INTEGRACIÓN CON OTROS ROLES

### COMERCIAL genera cotización
```
COMERCIAL: "Proyecto ACME Level 3 = $8K"
FINANCE: "OK. Costo estimado $4K. Margen 50%. Dentro de presupuesto Q3."
```

### PRODUCT MANAGER valida pricing
```
PRODUCT MANAGER: "¿Precio es competitivo?"
FINANCE: "Margen 50% = OK. Comparable con mercado."
```

### PROJECT MANAGER coordina ejecución
```
PM: "ACME: 8 semanas, timeline ajustado"
FINANCE: "Costo actualizado: $4K. Margen ahora 48%. OK"
```

---

## 11. REPORTES A PATRICIO

### Mensual (Primer viernes)
- P&L mensual
- Cash flow actual vs presupuesto
- Alertas si las hay
- YTD acumulado

### Trimestral
- Análisis rentabilidad por proyecto
- Comparación vs presupuesto Q
- Proyección anual
- Recomendaciones de pricing

### Anual
- Resumen año completo
- Tendencias
- Lecciones aprendidas
- Budget propuesto año siguiente

---

**Responsable:** Agente FINANCE/CFO  
**Aprobado por:** Patricio Ferrer  
**Vigencia:** 2026-07-27 onwards
