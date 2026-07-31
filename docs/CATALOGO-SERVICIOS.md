# 🛍️ CATÁLOGO DE SERVICIOS — CONSULTORAVIRTUAL

**Versión:** 1.0  
**Efectiva:** 2026-07-30  
**Fuente:** `ESCALERA-IA-POR-MADUREZ.md` + `REGLA-HABILITACION-POR-MADUREZ.md` +
conversación de diseño (2026-07-30)

---

## 🎯 LAS CUATRO FAMILIAS

Cada una responde a una pregunta diferente. **Todas pueden convivir en el mismo
cliente, en distintos momentos.**

---

## 1️⃣ PRODUCTIVIDAD CON IA

**¿Quién?** Una persona. La usa ella; si se va, el proceso sigue igual.

**¿Qué es?** Herramienta personal que **no toca el proceso**, solo acelera o
mejora cómo alguien hace su trabajo hoy.

**Estado mínimo:** **Cualquiera, incluso CIMIENTOS**

| Caso típico | Ejemplo concreto | Costo | Requisito |
|---|---|---|---|
| Redacción acelerada | Claude, ChatGPT, NotebookLM | Pago único por usuario | Nada |
| Resumen de documentos | "resumir las entradas de blog de este mes" | Pago único por usuario | Documentos ya existen |
| Asistente de catálogo | Hermes en LM Studio sobre manuales | Pago único por usuario | Manuales ya están escritos |
| Chatbot sobre FAQ | Chatbot que consulta la base de preguntas frecuentes | Pago único por usuario | FAQ escritas, acceso local, no responde a clientes |

**Cómo se vende:**

> *"Tu vendedor va a consultar el catálogo de proveedores en lenguaje natural,
> sin leer tablas. Sigue vendiendo como hoy — solo que más rápido."*

**Modelo de cobro:** Pago único por usuario + mantención reactiva (bolsa de
horas prepagada si algo se rompe o hay duda sobre cómo usarlo).

**Lo que NO incluye:** Cambio de proceso, integración con sistemas, personas
técnicas contratadas.

---

## 2️⃣ DIGITALIZAR

**¿Quién?** El proceso; una o varias personas lo ejecutan.

**¿Qué es?** El proceso queda igual, cambia el **medio** por el que circula la
información. Reemplaza tareas manuales de "copiar y pegar" o búsqueda, pero no
rediseña quién hace qué.

**Estado mínimo:** ORDEN_SIN_DATOS

| Caso típico | Ejemplo concreto | Requisito previo | Control |
|---|---|---|---|
| Dashboard sobre Excel | Power BI o Tableau sobre los números ya en planillas | Datos ya existen | No — se refresca, se ve |
| Búsqueda de documentos | Obsidian sobre la carpeta compartida | Documentos ya están | No — el usuario ve qué encontró |
| Mail automático | N8n que dispara correos según lista | Flujo ya definido | No — el correo ya fue redactado |
| **OCR simple** | Scanning de boletas a Excel | Planilla de destino existe | **Sí** — revisor de datos dudosos |
| **RAG textual** | "buscar en mis manuales" por palabras clave | Manuales vigentes | No — es búsqueda palabra exacta |

**Cómo se vende:**

> *"Los números están en Excel. Los traemos a un dashboard que se actualiza
> solo, y tu jefa de finanzas deja de armar el informe a mano. El proceso sigue
> igual — solo que el tiempo que gastaba ahora lo dedica a decidir qué hacer con
> esos números."*

**Modelo de cobro:** Proyecto (precio fijo, acotado). Si requiere control
(OCR), + mantención mensual (se indexa, se valida, se reentrena).

**Lo que NO incluye:** Cambio del proceso, personas técnicas que mantengan el
sistema, integración entre sistemas.

---

## 3️⃣ AUTOMATIZAR

**¿Quién?** El proceso; se rediseña **quién hace qué** y **en qué orden**.

**¿Qué es?** El software **reemplaza** un paso del proceso. Exige que el proceso
esté definido primero (porque hay que decidir qué automatizar y en qué casos
hacer excepción).

**Estado mínimo:** EN_CONSTRUCCION

| Caso típico | Rediseño que exige | Requisito previo | Control obligatorio |
|---|---|---|---|
| Chatbot que atiende | "primero se valida si es consulta FAQ; si no, escala a un humano" | Proceso definido de quién atiende qué | Responsable que revise las escaladas |
| Agendamiento automático | "la cita se registra, se agenda, se confirma — antes era manual" | Proceso de cómo se agenda | Responsable de confirmaciones dudosas |
| Cobranza escalonada | "a los 15 días se avisa; a los 30 se cobra; a los 45 se escala" | Registro de pagos | Auditor de excepciones |
| **Factura con OCR + validación** | "se extrae, se valida contra el rango esperado, se rechaza si sale fuera" | Proceso de ingreso definido | Revisor de rechazos |
| **Inventario con alertas** | "se registra el movimiento al hacer, no al contar; se alerta si baja de X" | Stock se registra en tiempo real | Encargado de alertas falsas |
| **RAG vectorial en proceso** | "el asistente responde consultas de clientes; un supervisor revisa lo raro" | Documentación vigente + personas capacitadas | Supervisor de respuestas |

**Cómo se vende:**

> *"Hoy tu vendedor nuevo aprende preguntándole al que sabe. Eso te quita 2
> horas de tu mejor vendedor **todos los días**. Podemos armar un asistente que
> responda las 20 preguntas que sí son técnicas — tu equipo sigue siendo el filtro
> de las que no lo son. Tu mejor vendedor deja de ser interrumpido, y el nuevo
> aprende más rápido."*

**Modelo de cobro:** Proyecto (precio según bandas Fase 2) + mantención mensual
(el modelo se degrada, hay que revalidar, hay que atender cambios de política).

**Lo que NO incluye:** Personas técnicas nuevas. Si el cliente necesita una,
eso no es un servicio nuestro.

---

## 4️⃣ ANTICIPAR

**¿Quién?** Los que toman decisiones.

**¿Qué es?** El software **predice** lo que va a pasar, **no** lo que pasó. Cambia
la naturaleza de la decisión (de reactivo a proactivo).

**Estado mínimo:** BASE_LISTA (y con dos condiciones adicionales)

| Caso típico | Decisión que cambia | Requisito previo | Condición |
|---|---|---|---|
| Predicción de demanda | De "vendo lo que me pide" a "preparo stock para lo que van a pedir" | 12+ meses de historia registrada, <5% huecos | Alguien con nombre que lea el resultado |
| Predicción de inasistencias | De "me entero cuando no llega" a "le pregunto el día anterior" | 6+ meses de registro, patrón identificable | Responsable RR.HH. que actúe sobre el aviso |
| Predicción de fuga de clientes | De "pierdo clientes sin saber por qué" a "identifico riesgo 2 meses antes" | Histórico de comportamiento de compra, 12+ meses | Ejecutivo de cuenta que llame antes |

**Cómo se vende:**

> *"Predecir se puede hacer, pero necesita dos cosas que hoy no tienes: historia
> registrada de manera pareja, y alguien acá que mire el resultado todas las
> semanas y decida con él. Si ordenamos el proceso y empezamos a registrar, en
> unos meses estás en condiciones. Hacerlo ahora sería venderte algo que no te
> va a servir."*

**Modelo de cobro:** Proyecto (evaluación adhoc — varía según complejidad,
volumen, calidad de datos) + mantención mensual (el modelo se degrada;
necesita persona que lo monitoree).

**Requisito especial:** Ver sección §4 "Evaluación de predicción" abajo.

---

## 🎯 CÓMO ELEGIR QUÉ OFRECER

**En la reunión inicial:**

1. **Ejecuta el test gratuito** → obtienes el estado MMA-OD.
2. **Pregunta qué duele** → identifica dónde quieren mejorar (pedidos mal tomados, vendedor nuevo tarda 3 meses, se pierden clientes sin razón).
3. **Compara con la tabla de §2 de `ESCALERA-IA-POR-MADUREZ.md`:**
   - Si el estado no habilita el caso → ofrece lo de "✨ Qué ofrecer HOY" (Productividad).
   - Si el estado habilita pero el proceso no está definido → propón Fase 1 (diagnóstico).
   - Si el estado habilita y el proceso está definido → cotiza el caso en la familia correcta.

---

## 📊 MATRIZ DE DECISIÓN RÁPIDA

Usa esto en reunión para orientar:

```
¿Toca el proceso?
├─ NO → PRODUCTIVIDAD
│  └─ Pago único por usuario
│  └─ Sin cambio de proceso
│
└─ SÍ
   ├─ ¿Rediseña quién hace qué?
   │  ├─ NO → DIGITALIZAR
   │  │  └─ El medio cambia, el proceso no
   │  │  └─ Requiere control si el modelo puede equivocarse
   │  │
   │  └─ SÍ
   │     ├─ ¿Predice o automatizan?
   │     │  ├─ Automatizan → AUTOMATIZAR
   │     │  │  └─ Se reemplaza un paso
   │     │  │  └─ Requiere control del resultado
   │     │  │
   │     │  └─ Predice → ANTICIPAR
   │     │     └─ Requiere BASE_LISTA + persona con nombre
   │     │     └─ Evaluación adhoc (varía mucho)
```

---

## 4️⃣ EVALUACIÓN DE PREDICCIÓN (adhoc)

Antes de cotizar cualquier modelo de predicción, haz estas 5 preguntas y toma
notas de las respuestas. La complejidad de la respuesta define el precio.

| # | Pregunta | Riesgo si no está claro |
|---|---|---|
| 1 | **¿Qué decisión concreta va a cambiar según el resultado?** | Vender un modelo que nadie usa |
| 2 | **¿Cuánta historia hay, y con qué % de huecos?** | Modelo entrena con ruido, predice mal |
| 3 | **¿Es tabular o hay texto/imagen de por medio?** (cambia costo 10x) | Sorpresa de precio a mitad del proyecto |
| 4 | **¿Cuál es el costo de equivocarse, y quién lo paga?** | Construimos una herramienta que nos demanda |
| 5 | **¿Quién —con nombre y cargo— lo va a mirar todas las semanas y decidir con él?** | Modelo degradado en 3 meses sin que nadie se dé cuenta |

**Regla:** si alguna respuesta es "no sabemos" o "alguien vemos", el cliente no
está en BASE_LISTA. Propón Automatizar primero para que registre datos limpios
durante 6-12 meses, y vuelve a este punto después.

---

## 💰 RESUMEN DE COBRO

| Familia | Modelo | Duración | Variabilidad |
|---|---|---|---|
| **Productividad** | Pago único + soporte reactivo | Instalación: 1 día | Baja (costo fijo) |
| **Digitalizar** | Proyecto fijo | 2-4 semanas | Media (puede haber sorpresas en integración) |
| **Automatizar** | Proyecto por bandas Fase 2 | 4-8 semanas | Media-alta (el control es lo que sale caro) |
| **Anticipar** | Evaluación adhoc + proyecto | 6-12 semanas | **Alta** (varía con datos y modelo) |

---

## 🚫 LO QUE NUNCA SE PROPONE

- **Predicción antes de BASE_LISTA** — aunque el cliente lo pida y pueda pagarlo.
- **Cualquier caso sin responsable identificado** — la regla de la persona con
  nombre aplica a todo.
- **Automatización sin control del resultado** — viola la regla del control.
- **Integración que exija personas técnicas nuevas** — viola R-3.

---

*Fuente de autoridad: REGLA-HABILITACION-POR-MADUREZ.md · ESCALERA-IA-POR-MADUREZ.md · Conversación de diseño 2026-07-30*

