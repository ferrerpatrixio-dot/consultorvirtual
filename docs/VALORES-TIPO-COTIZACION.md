# 💰 VALORES TIPO PARA COTIZACIÓN — SIN INGENIERÍA

**Referencia rápida para Fase 1 y Fase 2.**  
Estos son **precios sin detalle**: se refinan en Fase 1, se confirman en Fase 2.

---

## FASE 1: DIAGNÓSTICO

### Valor fijo

| Concepto | CLP | USD equiv | Quién lo financia |
|---|---|---|---|
| **Diagnóstico completo** | $450.000 | ~$450 | Sercotec 70% + Cliente 30% |
| **Diagnóstico acotado** (solo fotografía estado) | $150.000 | ~$150 | Cliente 100% |

### Qué incluye el completo

- Entrevistas (dueño, operarios, clientes)
- Levantamiento de procesos en sitio (1–2 días)
- Test MMA-OD
- Análisis de 3–5 casos de uso
- Documento + presentación + plan a 6 meses
- Valores estimados para cada caso (Fase 2)

### Duración

- **Inicio a decisión:** 1 semana
- **Inicio a cierre (si dicen sí):** 2–4 semanas

---

## FASE 2: IMPLEMENTACIÓN

### Matriz de precios por familia

| Familia | Entrada | Mid | Top | Control |
|---|---|---|---|---|
| **Productividad** | $5K | $10K | $15K | No |
| **Digitalizar** | $25K | $45K | $60K | Sí/No según caso |
| **Automatizar** | $60K | $120K | $180K | Sí (obligatorio) |
| **Anticipar** | $80K | $150K | $250K+ | Sí (obligatorio) |

---

### Casos típicos de SSTT (reparación móviles)

#### Caso 1: Dashboard de estado (DIGITALIZAR)

| Elemento | Costo | Plazo | Notas |
|---|---|---|---|
| Dashboard (en vivo: cola, reparación, listos) | $35K | 2 sem | Filtros por modelo, fecha, cliente |
| + Búsqueda por IMEI/cliente | $5K | 1 sem | Cliente busca su teléfono |
| + Notificaciones (SMS/email) | $15K | 1 sem | Aviso automático cuando está listo |
| + Asistente WhatsApp | $15K | 1 sem | Bot contesta "¿dónde está mi 123456?" |

**Entrada:** $35K solo dashboard  
**Recomendado:** $55K (dashboard + notificaciones + búsqueda)  
**Premium:** $70K (todo + WhatsApp)

**Control:** No (es consulta de datos ya registrados)

---

#### Caso 2: Automatizar recepción + control (AUTOMATIZAR)

| Elemento | Costo | Plazo | Notas |
|---|---|---|---|
| Formulario digital de recepción (reemplaza cuaderno) | $20K | 1 sem | Foto de teléfono, modelo, IMEI, falla |
| + Asignación automática a técnico | $15K | 1 sem | Sistema sugiere cuál técnico sigue |
| + Validación de salida (checklist) | $10K | 1 sem | Técnico confirma "listo": sistema valida datos |
| + Alertas por SLA (si > 5 días, aviso) | $10K | 1 sem | Notificación si se atrasa |
| + Dashboard de operarios | $15K | 1 sem | Carga de cada técnico en vivo |

**Entrada:** $20K solo recepción digital  
**Recomendado:** $50K (recepción + validación + alertas)  
**Premium:** $70K (todo + dashboard)

**Control:** Sí, en todos (revisor de rechazos / alertas falsas)

---

#### Caso 3: Todo integrado (AUTOMATIZAR upgrade)

| Elemento | Costo | Plazo | Notas |
|---|---|---|---|
| Recepción + procesamiento + entrega (casos 1+2) | $70K | 3 sem | Flujo de punta a punta |
| + Integración con SMS masivo (notificación a cliente) | $10K | 1 sem | Campaña automática "listos para retirar" |
| + Portal cliente (puede ver estado sin pedir) | $15K | 1 sem | Cliente login → ve su teléfono |
| + Reportes gerencial (diario/semanal) | $10K | 1 sem | "Hoy 12 terminados, 5 en cola, tiempo promedio 3.2 días" |

**Total:** $105K

**Control:** Sí (revisor de alertas, revisor de rechazos)

---

### Caso 4: Predicción de término (ANTICIPAR)

**Requisito:** 6+ meses de datos (modelo, tiempo real, técnico, falla).

| Elemento | Costo | Plazo | Notas |
|---|---|---|---|
| Diagnóstico de datos | $30K | 1 sem | ¿Hay suficiente historia? ¿Huecos? |
| Modelo predictivo básico | $80K | 2 sem | Por modelo: "iPhone X termina en ~2 días con 85% confianza" |
| + Notificación al cliente (ETA) | $15K | 1 sem | "Tu teléfono estará listo el jueves 14" |
| + Optimización de capacidad | $25K | 1 sem | Predice picos; sugiere si contratar técnico o no |

**Entrada:** $80K + $30K diagnóstico = $110K  
**Recomendado:** $110K + notificación = $125K  
**Premium:** todo = $155K

**Control:** Sí, obligatorio (encargado que revise predicción semanal)

---

## MANTENCIÓN MENSUAL

Aplica a todos excepto Productividad (que es una herramienta).

| Tipo | Costo mensual | Qué incluye |
|---|---|---|
| **Digitalizar** | $2.000 | Soporte, actualizaciones, bug fixes |
| **Automatizar** | $3.000–$5.000 | Soporte, re-entreno del modelo, ajustes de lógica |
| **Anticipar** | $5.000–$10.000 | Re-entreno mensual, validación de predicción, ajustes |

---

## CÓMO USAR ESTA TABLA EN LA REUNIÓN

### Escenario 1: "Muestrame un presupuesto"

> "Para un SSTT como ustedes, veo tres opciones:
>
> **Opción A (Digitalizar):** Dashboard + notificaciones = $55K, 3 semanas, $2K/mes.  
> → Clientes ven estado sin llamar.
>
> **Opción B (Automatizar):** Recepción digital + alertas + dashboard = $50K, 3 semanas, $3K/mes.  
> → Ustedes tienen control operativo.
>
> **Opción C (Ambas):** Todo integrado = $105K, 4 semanas, $4K/mes.  
> → Flujo de punta a punta, clientes + operarios + gerencia.
>
> ¿Cuál es la prioridad?"

### Escenario 2: "¿Eso incluye predicción?"

> "La predicción es más avanzada. Necesitan 6+ meses de datos limpios primero. Vemos después de Fase 2. Por ahora, **opción A o B te resuelve lo urgente**."

### Escenario 3: "Es mucho dinero"

> "Te dejo dos caminos:
>
> 1. **Fase 1 primero** ($450K, Sercotec financia 70% = $135K de tu bolsillo):  
>    → Precisamos bien qué es lo que duele, quién es el responsable, cuál es el cuello.  
>    → De ahí sale un presupuesto exacto (puede ser $30K, puede ser $100K).
>
> 2. **Audit rápida** ($150K):  
>    → Fotografía el estado, propongo 3 opciones, tú decides.
>
> ¿Cuál preferís?"

---

## REGLAS DE ORO

🚫 **NUNCA proponer:**
- Precio sin Fase 1 (a menos que sea audit rápida)
- Automatizar sin control (sin persona con nombre revisando)
- Precio en dólares (siempre CLP, o mostrar ambos)

✅ **SIEMPRE incluir:**
- Mantención mensual ("no es de una sola vez")
- Plazo realista ("3–4 semanas es lo mínimo")
- Responsable de control ("¿quién va a revisar los alertas?")

---

## DESCUENTOS / AJUSTES

### Por compra de múltiples productos

| Compra | Descuento |
|---|---|
| Digitalizar + Automatizar bundled | 5% en total |
| 3+ casos en Fase 2 | 10% en total |
| Contrato anual + prepago | 10% en total |

### Por antigüedad de cliente

- Primer proyecto: sin descuento
- Segundo proyecto: 5% (si el primero salió bien)
- Tercero+: 10%

---

## REFERENCIA A DOCUMENTOS

- **CATALOGO-SERVICIOS.md:** definiciones completas de cada familia
- **ESCALERA-IA-POR-MADUREZ.md:** tabla de qué estado habilita qué caso
- **KIT-DIAGNOSTICO-SSTT.md:** preguntas y documentos a levantar

---

*Versión: 2026-07-30*  
*Válido para: CONSULTORAVIRTUAL Fase 1 y 2*  
*Próxima revisión: Cuando varíe UF o cambien casos tipo*
