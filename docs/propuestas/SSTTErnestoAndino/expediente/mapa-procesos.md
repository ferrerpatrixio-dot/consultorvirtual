# 🗺️ Mapa de Procesos — SSTT Ernesto Andino

**Estado:** Actual (tal como operan hoy)  
**Levantado:** [A llenar post-reunión]  
**Validado por:** [A llenar]

---

## Flujo General (Alto Nivel)

```
CLIENTE REMITENTE      RECEPCIÓN           TALLER              CONTROL             ENTREGA
     │                    │                   │                   │                   │
     │  Envía móvil       │                   │                   │                   │
     ├─────────────────→  │                   │                   │                   │
     │  dañado            │  Registra         │                   │                   │
     │                    │  llegada          │                   │                   │
     │                    │  ¿Cómo?           │                   │                   │
     │                    │  [A llenar]       │                   │                   │
     │                    │                   │                   │                   │
     │                    │  Asigna           │                   │                   │
     │                    │  a técnico        │                   │                   │
     │                    ├─────────────────→ │  Repara           │                   │
     │                    │  ¿Cómo?           │  Limpia           │                   │
     │                    │  [A llenar]       │  Prueba           │                   │
     │                    │                   │  [Tiempo: ?]      │                   │
     │                    │                   │                   │                   │
     │                    │                   │  Marca            │                   │
     │                    │                   │  "Listo"          │                   │
     │                    │                   ├─────────────────→ │  Valida           │
     │                    │                   │  [A llenar]       │  Datos            │
     │                    │                   │                   │  ¿Cómo?           │
     │                    │                   │                   │  [A llenar]       │
     │                    │                   │                   │                   │
     │                    │                   │                   │  Notifica         │
     │                    │                   │                   │  cliente          │
     │                    │                   │                   ├─────────────────→ │
     │                    │                   │                   │  ¿Cómo?           │
     │                    │                   │                   │  [A llenar]       │
     │                    │                   │                   │                   │
     │                    │                   │                   │                   │
     │  Cliente retira    │                   │                   │                   │
     │←─────────────────────────────────────────────────────────────────────────────│
     │                    │                   │                   │                   │
```

---

## Detalle por Etapa

### 1️⃣ RECEPCIÓN

**Entrada:** Móvil llega (remitido por distribuidor comercializador)

**Actividades:**
- [ ] Recibir en zona física
- [ ] Registrar entrada (CÓMO: [A llenar])
- [ ] Datos que se registran:
  - [ ] Cliente/código
  - [ ] Modelo teléfono
  - [ ] IMEI
  - [ ] Falla reportada
  - [ ] Fecha entrada
  - [ ] Foto del daño (¿sí/no?) [A llenar]
  - [ ] Otra: [A llenar]
- [ ] Asignar a técnico (CÓMO: [A llenar])
- [ ] Pasar a reparación

**Duración estimada:** [A llenar] minutos  
**Persona responsable:** [A llenar]  
**Sistema actual:** [A llenar] (cuaderno/Excel/WhatsApp/etc)

**Problemas identificados:**
- [A llenar post-reunión]

---

### 2️⃣ REPARACIÓN

**Entrada:** Móvil asignado a técnico

**Actividades:**
- [ ] Técnico recibe orden (CÓMO: [A llenar])
- [ ] Diagnóstico de falla
- [ ] Reparación física
- [ ] Limpieza y acondicionamiento
- [ ] Prueba funcional
- [ ] Marcar como "Listo"

**Duración estimada:** [A llenar] horas/días  
**Técnicos disponibles:** [A llenar]  
**Variación por modelo:**
- iPhone X: [A llenar] horas
- Samsung [modelo]: [A llenar] horas
- Otros: [A llenar]

**Cuello de botella identificado:** [A llenar]  
**Falla más común:** [A llenar]  
**Tasa de re-trabajo:** [A llenar]%

**Sistema actual:** [A llenar] (registro manual/digital/etc)

**Problemas identificados:**
- [A llenar post-reunión]

---

### 3️⃣ CONTROL DE SALIDA

**Entrada:** Móvil marcado como "Listo"

**Actividades:**
- [ ] Validar que cumpla criterios ([A llenar cuáles])
- [ ] Registrar datos de salida
- [ ] Marcar en sistema (CÓMO: [A llenar])
- [ ] Preparar para notificación

**Duración estimada:** [A llenar] minutos  
**Persona responsable:** [A llenar]  
**Criterios de aceptación:** [A llenar]

**Sistema actual:** [A llenar]

**Problemas identificados:**
- [A llenar post-reunión]

---

### 4️⃣ ENTREGA / NOTIFICACIÓN AL CLIENTE

**Entrada:** Móvil aprobado en control

**Actividades:**
- [ ] Notificar al cliente que está listo (CÓMO: [A llenar])
- [ ] Cliente retira en persona (¿shipping?): [A llenar]
- [ ] Registrar salida (fecha, hora, quién retira)

**Métodos de notificación hoy:** [A llenar]  
**Tiempo de respuesta:** [A llenar]  
**Consultas diarias "¿dónde está?":** [A llenar] (estimado)

**Sistema actual:** [A llenar]

**Problemas identificados:**
- [A llenar post-reunión]

---

## Matriz de Estado

¿En qué punto del flujo puede estar un teléfono?

| Estado | Ubicación Física | Registro Hoy | Persona Responsable |
|--------|------------------|--------------|---------------------|
| **En cola de recepción** | Zona recepción | [A llenar] | [A llenar] |
| **En diagnóstico** | Taller | [A llenar] | [A llenar] |
| **En reparación** | Taller (técnico X) | [A llenar] | [A llenar] |
| **En espera de pruebas** | Taller | [A llenar] | [A llenar] |
| **Listo (en control)** | Control | [A llenar] | [A llenar] |
| **Listo (a entregar)** | Almacén/entrega | [A llenar] | [A llenar] |
| **Retirado** | Cliente | [A llenar] | [A llenar] |

---

## Puntos de Riesgo Actuales

| Punto | Riesgo | Impacto | Frecuencia |
|-------|--------|--------|-----------|
| **Recepción** | [A llenar] | [A llenar] | [A llenar] |
| **Taller** | [A llenar] | [A llenar] | [A llenar] |
| **Control** | [A llenar] | [A llenar] | [A llenar] |
| **Entrega** | [A llenar] | [A llenar] | [A llenar] |

---

## Capacidad Actual

| Métrica | Valor |
|---------|-------|
| **Móviles por semana** | [A llenar] |
| **Técnicos disponibles** | [A llenar] |
| **Modelos diferentes** | [A llenar] |
| **Tiempo promedio reparación** | [A llenar] |
| **Máximo en cola** | [A llenar] |
| **Tasa de cumplimiento SLA** | [A llenar] |

---

## Oportunidades de Mejora (Identificadas en Reunión)

### Corto plazo (Productividad IA)
- [ ] [A llenar]
- [ ] [A llenar]

### Mediano plazo (Digitalizar)
- [ ] [A llenar]
- [ ] [A llenar]

### Largo plazo (Automatizar/Anticipar)
- [ ] [A llenar]
- [ ] [A llenar]

---

## Diagrama Actual del Sistema

```
[A llenar con diagrama específico si hay sistema]

Hoy:
- Recepción: Cuaderno / Excel / WhatsApp
- Reparación: Asignación oral / WhatsApp
- Control: Manual / [A llenar]
- Entrega: Llamada telefónica / [A llenar]

Integración entre sistemas: NULA / [A llenar]
```

---

**Validado por cliente:** [ ] Sí [ ] No [ ] Parcialmente  
**Fecha validación:** [A llenar]  
**Actualizaciones pendientes:** [A llenar]
