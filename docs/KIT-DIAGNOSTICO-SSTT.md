# 🔧 KIT DE DIAGNÓSTICO — SSTT REPARACIÓN MÓVILES

**Para llevar a la reunión. Usar durante y después.**

---

## PARTE 1: TEST RÁPIDO (5 minutos en la reunión)

### Pregunta 1: ¿El proceso de recepción está documentado?

- [ ] No; cada técnico lo hace diferente
- [ ] Sí, pero solo en la cabeza del dueño
- [ ] Sí, escrito pero nadie lo sigue
- [ ] Sí, escrito y se sigue

**→ Si marcan las dos primeras: CIMIENTOS**

---

### Pregunta 2: ¿Dónde anotas que llegó un teléfono?

- [ ] Cuaderno; lista de WhatsApp; correo
- [ ] Planilla Excel (manual)
- [ ] Sistema / software (sin integraciones)
- [ ] Sistema integrado con el resto del flujo

**→ Si no es sistema: ORDEN_SIN_DATOS**

---

### Pregunta 3: ¿Cómo sabe el cliente cuándo sale su teléfono?

- [ ] Llama y pregunta
- [ ] Tú le avisas (cuando te acordás)
- [ ] Mensaje automático cuando está listo
- [ ] Portal donde ve el estado en tiempo real

**→ Si es las dos primeras: DATOS_SIN_ORDEN o CIMIENTOS**

---

### Pregunta 4: ¿Cuánto tarda en promedio reparar + limpiar + probar un teléfono?

- [ ] No sabemos; depende del modelo
- [ ] Sabemos el promedio general (~3 días)
- [ ] Sabemos por modelo (iPhone X: 2 días, Samsung: 3 días)
- [ ] Predecimos con 90%+ de precisión cuándo termina cada uno

**→ Si no saben por modelo: ORDEN_SIN_DATOS**

---

### Pregunta 5: ¿Qué duele más hoy?

- [ ] Clientes llaman diciendo "dónde está mi teléfono"
- [ ] Se pierden teléfonos en la recepción
- [ ] No sé cuántos están en cola, cuántos en reparación, cuántos listos
- [ ] Tarifa de reparación vs tiempo real de trabajo no cierra

**→ Marca esta; es tu caso de uso prioritario**

---

## PARTE 2: DOCUMENTOS A PEDIR / INVESTIGAR EN SITIO

### Logística de Recepción

**Llevar para ver en vivo:**

- [ ] Zona de recepción: cómo se registra llegada (cuaderno, sticker, planilla)
- [ ] ¿Qué datos anotan? (Cliente, teléfono, modelo, IMEI, falla reportada, fecha entrada, …?)
- [ ] ¿Hay foto del teléfono? ¿Foto de la falla?
- [ ] ¿Hay ticket o número de seguimiento?

**Preguntar:**

- "¿Cuántos teléfonos reciben por semana?"
- "¿Cuántos modelos diferentes?"
- "¿Cuál es el máximo en cola para reparación hoy?"

---

### Proceso de Reparación

**Llevar para ver:**

- [ ] Banco de trabajo: cómo se asigna un teléfono a un técnico
- [ ] ¿Usa orden de trabajo? ¿Oral? ¿Grupo de WhatsApp?
- [ ] ¿Cómo se registra "en reparación"?
- [ ] ¿Cómo se registra que terminó?

**Preguntar:**

- "¿Qué fallas son más comunes?"
- "¿Cuál es el cuello de botella? (recepción, diagnóstico, reparación, pruebas)"
- "¿Alguien se dedica solo a logística, o todos hacen todo?"

---

### Entrega y Notificación

**Llevar para ver:**

- [ ] ¿Cómo se notifica al cliente que está listo?
- [ ] ¿Hay un listado de "listos para retirar"?
- [ ] ¿Dónde guardan los teléfonos listos? ¿Con qué identificación?

**Preguntar:**

- "¿Cuántas consultas por teléfono/email reciben al día sobre 'dónde está mi móvil'?"
- "¿Qué % de clientes retira el mismo día que se avisa vs espera días?"

---

### Visibilidad / Reportes Hoy

**Preguntar:**

- "¿Tienen algún reporte? ¿Diario? ¿Semanal?"
- "¿Quién lo arma?"
- "¿Qué preguntas le hace al gerente?" (cuántos en cola, por cuánto tiempo, cuál es el cuello, cuánto recaudaron)

---

## PARTE 3: MATRIZ DE DECISIÓN RÁPIDA (para ti, después de la reunión)

| Hallazgo | Estado MMA-OD | Siguiente paso |
|---|---|---|
| No saben cuántos en cola, sin registro | **CIMIENTOS** | Propón Productividad: asistente para armado de checklist de recepción + hoja de ruta (Fase 1 diagnóstico primero) |
| Tienen Excel pero no automatizado, proceso roto | **ORDEN_SIN_DATOS** | Propón Digitalizar: dashboard que muestre en vivo (cola, en reparación, listos). Fase 1 → Fase 2 por bandas. |
| Tienen datos en sistemas distintos, proceso indefinido | **DATOS_SIN_ORDEN** | Propón primero ordenar (Fase 1), después automatizar |
| Datos + proceso, pero gestión manual | **EN_CONSTRUCCION** | Propón Automatizar: chatbot que consulte estado, notificaciones automáticas, alertas por SLA |
| Datos limpios + proceso + quieren predictiva | **BASE_LISTA** | Propón Anticipar: predecir cuándo termina c/teléfono, capacidad de cita |

---

## PARTE 4: OFERTA TIPO PARA ESTA REUNIÓN

### Fase 1: Diagnóstico

**Costo:** $450.000 CLP  
**Sercotec financia:** 70% (paga $135.000)  
**Duración:** 2–4 semanas  

**Incluye:**
- Levantamiento de proceso (estado actual)
- Identificación de 3 casos de uso posibles (Productividad + Digitalizar + Automatizar)
- Plan de implementación con presupuestos tipo
- Documentación del proceso

**Próximo paso si aprueban:** Propones Fase 2 según prioridad

---

### Fase 2: Implementación (valores tipo, sin ingeniería)

**Caso probable: DIGITALIZAR (Dashboard + notificaciones)**

| Alcance | Costo tipo | Plazo | Qué incluye |
|---|---|---|---|
| **Dashboard básico** | $35.000 | 2–3 semanas | En vivo: en cola, en reparación, listos. Filtro por modelo/fecha/cliente |
| **+ Notificaciones** | +$15.000 | +1 semana | SMS/correo cuando está listo. Cliente se entera automático |
| **+ Asistente de estado** | +$10.000 | +1 semana | Cliente pregunta por WhatsApp "¿dónde está mi 123456?" → bot responde |

**Total:** $60.000 (entrada a AUTOMATIZAR)

---

### Modelo de pago

- **Instalación:** Pago único (arriba)
- **Mantención:** $2.000/mes (actualizaciones, ajustes, soporte)
- **Sin lock-in:** Mensual, cancelable en cualquier momento

---

## PARTE 5: CHECKLIST PARA DESPUÉS DE LA REUNIÓN

- [ ] Fotos/videos de zona de recepción y reparación (para PowerPoint de Fase 1)
- [ ] Nombre de contacto técnico en CONSULTORAVIRTUAL (si siguen adelante)
- [ ] Permiso para acceder a sistema actual (si tienen)
- [ ] Confirmación de emails de clientes y gerente (para notificaciones)

---

## PARTE 6: MENSAJES CLAVE PARA CERRAR

### Si dicen "es muy caro"

> "El diagnóstico cuesta $450K, pero Sercotec te financia $315K. Tú pagas $135K. Es una inversión de 2-4 semanas para tener un plan donde no hay hoy. Y si después decidís no implementar, quedaste con un documento que vale más que lo que pagaste."

### Si dicen "implementamos nosotros después"

> "Perfecto. La Fase 1 te deja con un plan escrito, procesos documentados, y presupuestos claros. El software funciona; si alguien más lo mantiene después, la documentación está acá."

### Si dicen "no tenemos presupuesto"

> "Entendido. Te dejo dos opciones:
> 1. Sercotec te financia el diagnóstico — 70% de los $450K se lo pedís a ellos.
> 2. Empezamos con una auditoría más chica: 1 semana, $150K, solo fotografía el estado actual + propuesta.
>
> ¿Cuál te va?"

---

*Documento de referencia: `docs/CATALOGO-SERVICIOS.md` · `docs/ESCALERA-IA-POR-MADUREZ.md`*
