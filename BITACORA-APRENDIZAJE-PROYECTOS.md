# 📊 BITÁCORA DE APRENDIZAJE - PROJECT MANAGER

**Responsable:** PROJECT MANAGER (YO)  
**Objetivo:** Capturar problemas, soluciones y lecciones de cada proyecto para mejorar futuras estimaciones  
**Frec. Actualización:** Semanal (cada viernes) + Postmortem al cierre  

---

## 📋 ESTRUCTURA

```
PROYECTO: [Nombre]
├─ Duración estimada: X semanas
├─ Duración real: Y semanas
├─ Desviación: +/-Z%
├─ Problemas encontrados: [lista]
├─ Soluciones aplicadas: [lista]
├─ Lecciones aprendidas: [lista]
└─ Recomendaciones para próximos: [lista]
```

---

## 🔴 BITÁCORA SEMANAL

**Cada VIERNES, actualizo:**

### Formato Entrada Semanal

```
PROYECTO: [Nombre]
SEMANA: [X de Y]
FECHA: [DD-MM-YYYY]
ESTADO: [En progreso / Bloqueado / Adelantado / En plazo]

PROGRESO TÉCNICO:
├─ Hito planeado: [qué iba a pasar]
├─ Hito real: [qué pasó]
├─ % completitud: [X%]
└─ Delta: [¿adelante/atrás?]

PROBLEMAS ENCONTRADOS:
├─ [Problema 1]: Descripción
│  ├─ Causa raíz: [análisis]
│  ├─ Impacto: [tiempo: Xh, costo: $Y]
│  └─ Solución: [aplicada/planeada]
│
├─ [Problema 2]: ...
└─ [Problema N]: ...

BLOQUEADORES ACTIVOS:
├─ [Bloq 1]: Descripción (resolución: planeada para semana X)
└─ [Bloq 2]: ...

RECURSOS:
├─ ARQUITECTO: [h/semana utilizado vs planeado]
├─ DEV: [h/semana utilizado vs planeado]
├─ QA: [h/semana utilizado vs planeado]
└─ DELIVERY: [h/semana utilizado vs planeado]

RIESGOS IDENTIFICADOS:
├─ [Riesgo 1]: Probabilidad [Alta/Media/Baja], Impacto [Alto/Medio/Bajo]
└─ [Riesgo 2]: ...

NOTAS:
├─ Salida del equipo buena / Moral OK
├─ Cliente colaborando / Delays en feedback
└─ Otros comentarios relevantes

FORECAST PRÓXIMA SEMANA:
└─ Go-live en línea: SÍ / POSIBLE / EN RIESGO
```

---

## 📉 SEGUIMIENTO DE ESTIMACIONES

**Mantener tabla de comparación:**

```
PROYECTO | ESTIMADO | REAL | DELTA | CAUSA PRINCIPAL
----------|----------|------|-------|------------------
ACME | 8 sem | 9 sem | +12% | Feedback cliente lento + Cambio scope semana 5
XYZ | 6 sem | 6 sem | 0% | Equipo bien coordinado
DEMO | 4 sem | 6 sem | +50% | Underestimate QA + Cambios último minuto
```

**Patrones a detectar:**
- ¿Siempre DEV tarda más? → Aumentar estimación DEV 15%
- ¿Siempre feedback cliente lento? → Buffer cliente feedback
- ¿QA tarda más en clientes grandes? → Escalar QA por volumen datos
- ¿Cambios scope a mitad? → Mejor comunicación early requirements

---

## 🏁 POSTMORTEM AL CIERRE

**Cuando proyecto termina (Go-live + entrega final):**

### Estructura Postmortem

```
════════════════════════════════════════════
    POSTMORTEM PROJECT: [Nombre]
════════════════════════════════════════════

DATOS GENERALES
├─ Fecha inicio: DD-MM-YYYY
├─ Fecha go-live: DD-MM-YYYY
├─ Duración total: X semanas
├─ Estimación original: Y semanas
├─ Desviación: +/- Z%
├─ Estado cierre: ✅ Exitoso / ⚠️ Parcial / ❌ Problemático
├─ Margen final: X% (presupuesto vs costo real)
└─ Cliente satisfacción: [Muy buena / Buena / Aceptable / Pobre]

════════════════════════════════════════════

1. ¿QUÉ SALIÓ BIEN?
════════════════════════════════════════════

✅ Fortaleza 1: [Descripción + por qué]
   └─ Replicar en: [próximos proyectos]

✅ Fortaleza 2: [Descripción + por qué]
   └─ Replicar en: [próximos proyectos]

✅ Fortaleza 3: ...

CONCLUSIÓN: 3 cosas a mantener en próximos proyectos

════════════════════════════════════════════

2. ¿QUÉ SALIÓ MAL?
════════════════════════════════════════════

❌ Problema 1: [Descripción]
   ├─ Impacto: +X horas, $Y de costo extra
   ├─ Causa raíz: [análisis profundo]
   ├─ Cuándo ocurrió: Semana X
   └─ Cómo se resolvió: [solución aplicada]

❌ Problema 2: ...

❌ Problema 3: ...

CONCLUSIÓN: 3 cosas a evitar en próximos proyectos

════════════════════════════════════════════

3. DESVIACIÓN DE ESTIMACIÓN
════════════════════════════════════════════

ORIGINAL: Y semanas
REAL: X semanas
DELTA: +/- Z%

ANÁLISIS:
├─ ARQUITECTO: Planeado 40h, Real 48h (+20%)
│  └─ Causa: [Complejidad data model subestimada]
│
├─ DEV: Planeado 80h, Real 92h (+15%)
│  └─ Causa: [Integraciones más complejas]
│
├─ QA: Planeado 30h, Real 38h (+27%)
│  └─ Causa: [Regression testing + edge cases]
│
└─ DELIVERY: Planeado 10h, Real 12h (+20%)
   └─ Causa: [Capacitación más larga que esperada]

FACTORES MACRO:
├─ Feedback cliente: Lento (retrasos 1-2 días)
├─ Alcance: +15% vs original (cliente pidió cambios)
├─ Team: 1 developer enfermo (1 semana)
└─ Tecnología: Learning curve Vercel Edge (no estimada)

PROYECCIÓN FUTURA:
└─ Proyectos similares estimar: +20% de buffer

════════════════════════════════════════════

4. LECCIONES APRENDIDAS
════════════════════════════════════════════

LECCIÓN 1: [Título]
├─ Contexto: [Cuándo aprendimos esto]
├─ Implicación: [Qué cambia]
├─ Aplicar a: [Próximos proyectos]
└─ Propietario: [Quién implementa cambio]

LECCIÓN 2: ...

LECCIÓN 3: ...

════════════════════════════════════════════

5. FINANCIERO
════════════════════════════════════════════

INGRESOS:
├─ Presupuesto original: $X
├─ Cambios cliente (scope): +$Y / -$Z
├─ Ingreso final: $[Total]
└─ Estado: [Pago 50% firma OK, 30% hito OK, 20% final pendiente]

COSTOS:
├─ Estimado: $A
├─ Real: $B
├─ Diferencia: $C (+/- %)
└─ Desglose:
    ├─ ARQUITECTO: $A1 real vs $A1e estimado
    ├─ DEV: $D1 real vs $D1e estimado
    ├─ QA: $Q1 real vs $Q1e estimado
    ├─ DELIVERY: $DE1 real vs $DE1e estimado
    └─ Prorrateo costos fijos: $F

MARGEN:
├─ Estimado: X%
├─ Real: Y%
├─ Status: ✅ OK / ⚠️ BAJO / ❌ NEGATIVO
└─ Análisis: [Si bajo, causa]

════════════════════════════════════════════

6. SATISFACCIÓN CLIENTE
════════════════════════════════════════════

NPS (Net Promoter Score): [0-10]
├─ ¿Recomendaría CONSULTORAVIRTUAL?: Sí / Posible / No
├─ ¿Está satisfecho con solución?: Muy / Bastante / Poco / Nada
├─ ¿Valor recibido vs precio?: Excelente / Bueno / OK / Bajo

FEEDBACK CLIENTE:
├─ Lo que amaron: [lista]
├─ Lo que mejorarían: [lista]
└─ Recomendaciones: [lista]

FOLLOW-UP:
├─ ¿Expansión futura?: Sí [scope] / Posible / No
├─ ¿Referencia?: Autorizado / Pendiente / No
└─ ¿Contrato mantenimiento?: Sí / Pendiente / No

════════════════════════════════════════════

7. RECOMENDACIONES FUTURAS
════════════════════════════════════════════

PARA PROYECTOS SIMILARES:
├─ Aumentar estimación DEV: +15%
├─ Incluir buffer feedback cliente: +1 semana
├─ QA adicional si BD grande: +20%
└─ Onboarding cliente: +2 días

CAMBIOS DE PROCESO:
├─ [Cambio 1]: [Qué cambiar y por qué]
├─ [Cambio 2]: ...
└─ [Cambio N]: ...

CAPACITACIÓN NECESARIA:
├─ ARQUITECTO: [Tema + razón]
├─ DEV: [Tema + razón]
└─ QA: [Tema + razón]

════════════════════════════════════════════

8. ACCIONES Y RESPONSABLES
════════════════════════════════════════════

□ [Acción 1]: Responsable, Fecha de cierre
□ [Acción 2]: Responsable, Fecha de cierre
□ [Acción 3]: Responsable, Fecha de cierre

════════════════════════════════════════════

APROBADO POR: PROJECT MANAGER (YO)
FECHA POSTMORTEM: DD-MM-YYYY
ARCHIVO GUARDADO: /docs/postmortems/[Nombre]_[Fecha].md
```

---

## 📈 MATRIZ DE ESTIMACIÓN (Evoluciona con aprendizaje)

**Actualizar mensualmente basado en postmortems:**

```
TIPO PROYECTO | TAMAÑO | ESTIMACIÓN INICIAL | FACTOR AJUSTE | ESTIMACIÓN NUEVA
─────────────|--------|─────────────────|───────────────|─────────────────
Diagnóstico | Pequeño | 4 semanas | 1.0x | 4 semanas
Diagnóstico | Mediano | 6 semanas | 1.1x | 6.6 semanas
Diagnóstico | Grande | 8 semanas | 1.2x | 9.6 semanas
            |         |           |      |
Implementación | Pequeño | 6 semanas | 1.15x | 6.9 semanas
Implementación | Mediano | 12 semanas | 1.2x | 14.4 semanas
Implementación | Grande | 16 semanas | 1.25x | 20 semanas
            |         |           |      |
AutoML | Pequeño | 8 semanas | 1.3x | 10.4 semanas
AutoML | Mediano | 12 semanas | 1.35x | 16.2 semanas
```

**Cálculo factor ajuste:**
```
Factor = Promedio (Real / Estimado) últimos 3 proyectos similares
Ejemplo: Si últimos 3 diag pequeños fueron +10%, +15%, +5%
         Factor = (1.1 + 1.15 + 1.05) / 3 = 1.1x
```

---

## 🔄 CICLO COMPLETO

### Fase 1: DURANTE PROYECTO (Semanalmente)

```
VIERNES:
├─ Actualizar bitácora semanal
├─ Identificar problemas
├─ Soluciones aplicadas
├─ Forecast próxima semana
└─ Escalar bloqueadores si hay
```

### Fase 2: CIERRE (Dentro de 3 días de go-live)

```
CIERRE:
├─ Compilar bitácora completa
├─ Recopilar datos finales (horas, costos)
├─ Entrevistar equipo (ARQUITECTO, DEV, QA, DELIVERY)
├─ Feedback cliente final
├─ Redactar postmortem
└─ Guardar en archivo
```

### Fase 3: APLICACIÓN (Para próximos proyectos)

```
NUEVO PROYECTO:
├─ Revisar postmortems proyectos similares
├─ Aplicar factores ajuste estimación
├─ Incorporar lecciones (proceso, capacitación)
├─ Comunicar equipo: "Aprendimos X, ahora hacemos Y"
└─ Comparar vs estimación antigua en postmortem siguiente
```

---

## 📚 EJEMPLOS DE POSTMORTEM

### Ejemplo 1: Proyecto EXITOSO (0% desviación)

```
PROYECTO: Diagnóstico Madurez - ACME (Clínica)
ESTIMACIÓN: 4 semanas
REAL: 4 semanas
DELTA: 0% ✅

¿QUÉ SALIÓ BIEN:
✅ Equipo estable (sin cambios)
✅ Cliente responsivo (feedback en 24h)
✅ Scope claro desde inicio
✅ ARQUITECTO estimó perfecto

¿QUÉ SALIÓ MAL:
❌ Ningún problema mayor

LECCIONES:
- Cuando cliente participa activamente, proyecto va en plazo
- 4 semanas es estimación correcta para Diagnóstico pequeño
- Equipo estable = predictibilidad

RECOMENDACIÓN:
→ Mantener factor 1.0x para diagnósticos pequeños con cliente responsivo
→ Priorizar clientes con feedback rápido
```

### Ejemplo 2: Proyecto SOBREESTIMADO (+50%)

```
PROYECTO: AutoML - XYZ (Retail)
ESTIMACIÓN: 8 semanas
REAL: 12 semanas
DELTA: +50% ❌

¿QUÉ SALIÓ BIEN:
✅ DEV fue rápido en implementación
✅ QA encontró todos bugs (zero production issues)
✅ Cliente muy satisfecho (NPS 9/10)

¿QUÉ SALIÓ MAL:
❌ Feedback cliente lento (promedio 3-4 días)
❌ Scope creep semana 6 (+15% features)
❌ QA más testing que esperado (edge cases)
❌ Delivery necesitó más capacitación

CAUSA RAÍZ:
- Subestimamos impacto "feedback lento" (4 días × 5 veces = 3 semanas perdidas)
- Cliente pedía cambios, no era claro scope original
- QA no escalado por complejidad datos retail

LECCIONES:
- AutoML con cliente sin SLA feedback: +20% buffer
- "Cambios cliente" = predecible, no sorpresa
- Retail = datos messy, QA +25%

RECOMENDACIÓN:
→ AutoML mediano ahora 10 semanas (fue 8)
→ Mejor SLA feedback cliente desde contrato
→ QA escalable por tamaño datos
```

---

## ✅ RESPONSABILIDADES

### PROJECT MANAGER (YO)

- ✅ Llenar bitácora semanal (viernes)
- ✅ Capturar problemas en tiempo real
- ✅ Documentar soluciones
- ✅ Redactar postmortem (3 días cierre)
- ✅ Actualizar matriz estimación
- ✅ Comunicar lecciones al equipo

### EQUIPO (ARQUITECTO, DEV, QA, DELIVERY)

- ✅ Reportar problemas cuando ocurren
- ✅ Sugerir soluciones
- ✅ Participar en postmortem (entrevista)
- ✅ Implementar cambios de proceso

---

## 📂 ARCHIVO DE POSTMORTEMS

**Estructura:**
```
docs/
├─ postmortems/
│  ├─ 2026-07_ACME_Diagnostico.md
│  ├─ 2026-07_XYZ_AutoML.md
│  ├─ 2026-07_DEMO_Sistema.md
│  └─ ESTIMACION_MATRIX.md (actualiza mensual)
```

**Búsqueda antes de nuevo proyecto:**
```
"¿Nuevo proyecto tipo Diagnóstico + cliente pequeño?"
→ Revisar: "2026-07_ACME_Diagnostico.md"
→ Factor estimación: 1.0x
→ Lecciones: Cliente responsivo = éxito
```

---

*Este ciclo garantiza que cada proyecto nos enseña algo*  
*Las estimaciones mejoran con cada cierre*  
*No repetimos errores, replicamos éxitos*  
*Responsable: YO (PROJECT MANAGER)*
