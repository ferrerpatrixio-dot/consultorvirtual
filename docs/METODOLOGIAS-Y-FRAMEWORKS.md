# 🎯 METODOLOGÍAS Y FRAMEWORKS - CONSULTORAVIRTUAL

**Objetivo:** Centralizar todas las metodologías y frameworks que usamos en consultora  
**Versión:** 1.0  
**Fecha:** 2026-07-27  

---

## 📚 STACK METODOLÓGICO

### Nivel 1: DIAGNÓSTICO Y MAPEO (Etapa 1)

#### 🔷 BPMN 2.0 - Business Process Model and Notation

**¿Qué es?**
```
BPMN = Notación estándar para mapear procesos de negocio
└─ Muestra: Actividades, actores, decisiones, flujo
└─ Idioma: Universal (mismo en cualquier industria)
└─ Propósito: Entender CÓMO funciona la operación hoy
```

**¿Cómo lo usamos en CONSULTORAVIRTUAL?**
```
ETAPA 1 (Diagnóstico):
├─ Mapeamos procesos actuales del cliente con BPMN
├─ Identificamos ineficiencias visualmente
├─ Mostramos a cliente: "Esto es lo que pasa hoy"
├─ Base para proponer mejoras (Etapa 2)
└─ Documentamos para futuro (capacitación, auditoría)
```

**Documentación:**
```
BPMN_Recepcion_Equipos.pdf
├─ Ejemplo: Proceso de recepción (real)
│
BPMN_ARQUITECTONICO_*.pdf/html/json
├─ Modelo arquitectónico completo
├─ Visiones diferentes (JSON para sistemas, HTML para visual)
│
Comparativa_BPMN_Skills.pdf
├─ Mapeo de habilidades vs procesos
│
sistemaaiprocess/prompts/mapa-procesos-nivel0.md
├─ Mapa de procesos nivel 0 (alto nivel)
```

**Casos de uso:**
```
✓ Cliente dice "Nuestro proceso es caótico"
  → Mapeamos con BPMN
  → Mostramos visualmente dónde está el caos
  → Proponemos soluciones basadas en mapa

✓ Cliente quiere implementar RPA
  → BPMN primero (entienden qué automatizar)
  → Luego RPA (saben exactamente qué pasos)

✓ Capacitación post-implementación
  → Usa BPMN nuevo (con cambios)
  → Equipo entiende: "Esto cambió"
```

---

### Nivel 2: EVALUACIÓN DE MADUREZ (Etapa 1)

#### 🔷 MMA-OD - Matriz de Madurez Operacional (Orden/Datos)

**¿Qué es?**
```
MMA-OD = Framework propio CONSULTORAVIRTUAL
├─ 2 dimensiones: ORDEN (procesos) + DATOS (información)
├─ 5 niveles: 0 (caótico) → 4 (optimizado)
└─ Propósito: Medir en qué nivel de madurez está cliente
```

**¿Cómo lo usamos?**
```
ETAPA 1 (Diagnóstico):
├─ Test MMA-OD (7 preguntas interactivas)
├─ Cliente responde en 5 minutos
├─ Resultado: Nivel de madurez (0-4)
├─ Reporte visual: "Estás en nivel X"
└─ Este nivel define qué IA es viable (Etapa 2)
```

**Conexión con IA:**
```
Nivel 0: "Caótico"
└─ IA viable: NINGUNA (arregla procesos primero)

Nivel 1: "Empezando a ordenar"
└─ IA viable: RPA simple (automatizar manual)

Nivel 2: "Procesos claros + datos parciales"
└─ IA viable: Predictivos (si datos suficientes)

Nivel 3: "Procesos maduros + datos consolidados"
└─ IA viable: IA avanzada, decisiones automáticas

Nivel 4: "Optimizado"
└─ IA viable: Closed-loop (IA aprende de resultados)
```

---

### Nivel 3: OPTIMIZACIÓN OPERACIONAL (Etapa 2-3)

#### 🔷 LEAN - Eliminación de Desperdicio

**¿Qué es?**
```
LEAN = Eliminar actividades que no generan valor
├─ Identificar: ¿Qué actividades son desperdicio?
├─ Eliminar o automatizar lo que no suma
└─ Propósito: Eficiencia, velocidad, costo
```

**¿Cómo lo usamos?**
```
ETAPA 2 (Visualizar oportunidades):
├─ Analizamos con BPMN + LEAN
├─ Identificamos "desperdicio" (demoras, re-trabajo)
├─ Proponemos eliminar + automatizar
└─ Esto alinea con oportunidades IA

Ejemplo:
├─ "Este proceso tiene 5 re-trabajos"
├─ Desperdicio = 20% del tiempo
├─ Solución LEAN: Automatizar validación
├─ Resultado: -20% tiempo, -30% errores
```

**Documentación:**
```
Integrado en:
└─ BPMN (marcamos como "desperdicio" en mapa)
└─ Diagnóstico (identificamos en Etapa 1)
```

---

#### 🔷 SIX SIGMA - Mejora Continua de Calidad

**¿Qué es?**
```
SIGMA = Reducir variabilidad y defectos
├─ Medida: Defectos por millón (DPM)
├─ Proceso: Define → Mide → Analiza → Mejora → Controla
└─ Propósito: Calidad consistente
```

**¿Cómo lo usamos?**
```
ETAPA 3-4 (Ejecutar + Optimizar):
├─ Después de implementar IA
├─ Medimos: "¿Cómo de bueno es resultado?"
├─ Usamos SIGMA para reducir errores
├─ Monitoreamos en vivo (Etapa 4)

Ejemplo:
├─ "Predicción tiene 10% error"
├─ Meta SIX SIGMA: Reducir a 3%
├─ Acciones: Más datos, mejor modelo, validación
├─ Monitoreo: Diario, con alertas
```

**Documentación:**
```
Implícito en:
└─ POLITICA_FINANCIERA.md (métricas de calidad)
└─ BITACORA-APRENDIZAJE-PROYECTOS.md (postmortem mejora)
```

---

### Nivel 4: TRANSFORMACIÓN DIGITAL (Etapa 4)

#### 🔷 CHANGE MANAGEMENT - Gestión del Cambio

**¿Qué es?**
```
CHANGE = Ayudar a organización a adoptar cambios
├─ Gestionar resistencia
├─ Comunicar beneficios
├─ Capacitar
└─ Sostener nuevas prácticas
```

**¿Cómo lo usamos?**
```
ETAPA 3-4 (Ejecutar + Optimizar):
├─ No es suficiente "meter IA"
├─ Necesitamos que equipo la USE
├─ Plan de cambio:
│  ├─ Comunicar: ¿Por qué IA?
│  ├─ Capacitar: ¿Cómo se usa?
│  ├─ Soportar: Primeras semanas críticas
│  └─ Medir: ¿Adoptó? ¿Funciona?

Ejemplo:
├─ Implementamos chatbot
├─ Sin cambio management: Se queda sin usar
├─ Con cambio management: Equipo lo adopta + optimiza
```

**Documentación:**
```
BITACORA-APRENDIZAJE-PROYECTOS.md
└─ Postmortem incluye: ¿Equipo adoptó?

Innovacion-empresarial-con-IA-Unidad-2-Roles-y-competencias-en-la-era-de-la-IA.pdf
└─ Capacitación en nuevos roles
```

---

## 🔗 MATRIZ: METODOLOGÍA ↔ ETAPA CONSULTORAVIRTUAL

| Metodología | Etapa 1 | Etapa 2 | Etapa 3 | Etapa 4 |
|---|---|---|---|---|
| **BPMN** | ✅ Mapear procesos | ✅ Rediseño | ✅ Valida cambios | ⚠️ Documentación |
| **MMA-OD** | ✅ Test madurez | ✅ Define viabilidad IA | - | ⚠️ Re-test |
| **LEAN** | ⚠️ Identifica desperdicio | ✅ Propone eliminación | ✅ Implementa | ✅ Monitorea |
| **SIX SIGMA** | - | - | ✅ Valida calidad | ✅ Controla defectos |
| **CHANGE MGT** | - | - | ✅ Capacita | ✅ Sostiene adopción |

---

## 📋 CÓMO USAR METODOLOGÍAS POR ROL

### ARQUITECTO

```
Diagnóstico:
1. Lee BPMN cliente
2. Analiza con LEAN (dónde está desperdicio)
3. Conecta con MMA-OD (nivel madurez)
4. Propone arquitectura que elimina desperdicio + cabe en nivel madurez
```

### PRODUCT MANAGER

```
Visualizar oportunidades:
1. BPMN muestra procesos ineficientes
2. LEAN identifica qué eliminar
3. MMA-OD dice qué IA es viable
4. Propones soluciones prácticas (no soñar con humo)
```

### PROJECT MANAGER

```
Ejecutar:
1. BPMN nuevo (con cambios IA)
2. Equipo entiende cambios
3. LEAN + SIX SIGMA = validación de mejora
4. CHANGE MGT = asegurar adopción

Ejemplo:
├─ "Antes: Recepción de equipos 2 horas"
├─ "Después: 30 minutos (RPA + validación)"
├─ "Ahorro: 7.5 horas/día = $X/mes"
```

---

## 📁 ESTRUCTURA DE CARPETAS

```
docs/
├─ diplomado/
│  └─ [Como antes - cursos IA]
│
├─ metodologias/
│  ├─ BPMN/
│  │  ├─ BPMN_Recepcion_Equipos.pdf
│  │  ├─ BPMN_ARQUITECTONICO_VISUAL.html
│  │  ├─ BPMN_ARQUITECTONICO_RECEPCION_EQUIPOS.json
│  │  ├─ Comparativa_BPMN_Skills.pdf
│  │  └─ GUIA-BPMN-CONSULTORAVIRTUAL.md
│  │
│  ├─ MMA-OD/
│  │  ├─ FRAMEWORK-MADUREZ.md
│  │  ├─ Escala-Madurez-de-IA.md
│  │  └─ TEST-MMA-OD-7-PREGUNTAS.md
│  │
│  ├─ LEAN/
│  │  ├─ GUIA-LEAN-ELIMINACION-DESPERDICIO.md
│  │  └─ EJEMPLOS-DESPERDICIO-BPMN.md
│  │
│  ├─ SIX-SIGMA/
│  │  ├─ GUIA-SIGMA-CONTROL-CALIDAD.md
│  │  └─ METRICAS-DEFECTOS.md
│  │
│  └─ CHANGE-MANAGEMENT/
│     ├─ GUIA-ADOPCION-IA.md
│     └─ PLAN-CAMBIO-TEMPLATE.md
│
├─ procesos/
│  ├─ mapa-procesos-nivel0.md
│  ├─ proceso-recepcion-equipos.pdf
│  └─ [Otros procesos]
│
└─ METODOLOGIAS-Y-FRAMEWORKS.md (este archivo)
```

---

## ✅ CHECKLIST: USAMOS METODOLOGÍAS CUANDO

```
CLIENTE LLEGA:
□ ¿Mapeo procesos con BPMN? (SÍ → Etapa 1)
□ ¿Evalúo madurez con MMA-OD? (SÍ → Etapa 1)
□ ¿Identifico desperdicio con LEAN? (SÍ → Etapa 2)
□ ¿Valido calidad con SIX SIGMA? (SÍ → Etapa 3)
□ ¿Gestiono cambio para adopción? (SÍ → Etapa 3-4)

PROYECTO CIERRA:
□ ¿Documenté con BPMN nuevo? (Para futuro)
□ ¿Medir adopción vs planeado? (CHANGE MGT)
□ ¿Resultados vs meta? (SIX SIGMA, LEAN)
□ ¿Postmortem incluye metodologías? (Para aprendizaje)
```

---

## 🎖️ DIFERENCIADOR VS COMPETENCIA

```
COMPETENCIA:
"Hacemos transformación digital"
(Sin framework claro)

NOSOTROS:
"Hacemos transformación digital con:
├─ BPMN (mapeamos procesos)
├─ MMA-OD (diagnosticamos madurez)
├─ LEAN (eliminamos desperdicio)
├─ SIX SIGMA (validamos calidad)
└─ CHANGE MGT (aseguramos adopción)

Cada paso tiene fundamento metodológico."
```

---

## 📚 INTEGRACIÓN CON DIPLOMADO

```
Diplomado IA (TEORÍA):
├─ Unidad 1-6: Cómo funcionan soluciones IA
└─ Innovación: Cómo adoptar

Metodologías (PRÁCTICA):
├─ BPMN: Dónde va la IA (mapeo)
├─ MMA-OD: Cuándo va (nivel madurez)
├─ LEAN: Qué problemas resuelve (desperdicio)
├─ SIX SIGMA: Cuán bien funciona (calidad)
└─ CHANGE MGT: Cómo se usa (adopción)

RESULTADO = Consultora que sabe TEORÍA + PRÁCTICA
```

---

**CONCLUSIÓN:**

CONSULTORAVIRTUAL no usa "metodologías genéricas".  
Tiene stack específico: BPMN, MMA-OD, LEAN, SIX SIGMA, CHANGE MGT.

Cada metodología = Una etapa de transformación.  
Cada proyecto = Usa stack completo.

= **Consultoría metodológica, fundamentada, no improvisada.**

---

*Metodologías documentadas y listas para usar.*  
*Integración con diplomado: Teoría + Práctica.*
