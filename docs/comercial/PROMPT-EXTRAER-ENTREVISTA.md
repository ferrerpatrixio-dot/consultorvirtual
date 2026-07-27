# 🎙️ DE LA GRABACIÓN A LA HOJA DE CAPTURA

**Para:** Patricio Ferrer · **Todo local, el audio nunca sale del PC**

---

## EL FLUJO

```
1. Grabas con el teléfono (con permiso)
2. WHISPER large-v3 local        → transcripcion.txt
3. HERMES en LM Studio           → hoja de captura llena
4. Tú revisas y corriges          ← paso obligatorio, no opcional
```

**Hermes va mejor que Llama aquí:** está afinado para respetar formatos de
salida. Si notas que se pone conversador o inventa campos, baja la temperatura
a **0.2** — no queremos creatividad, queremos fidelidad.

---

## EL PROMPT

Pega la transcripción donde dice `[TRANSCRIPCIÓN]` y envía esto tal cual:

```
Eres un asistente que extrae información de la transcripción de una reunión
comercial entre un consultor de procesos y el dueño de una PYME chilena.

Tu única tarea es LLENAR LA FICHA de abajo con lo que efectivamente se dijo.

REGLAS ESTRICTAS:
1. Si un dato NO aparece en la transcripción, escribe exactamente: NO SE MENCIONÓ
2. NUNCA infieras, deduzcas ni completes con lo que "probablemente" quiso decir
3. Las cifras van tal como las dijo el cliente, con sus palabras
4. Si el cliente dio un rango o dudó, anota el rango y la duda
5. Cuando una respuesta sea importante, cita la frase textual entre comillas
6. No agregues secciones ni comentarios fuera de la ficha
7. No opines sobre el cliente ni recomiendes nada

FICHA:

== IDENTIFICACIÓN ==
Empresa:
Rubro:
Comuna / ubicación:
Nombre del interlocutor:
¿Es quien decide? (sí / no / no se mencionó):

== A. DOLOR Y QUÉ YA INTENTÓ ==
Qué le duele hoy:
Qué ya intentó antes:
Con quién lo intentó:
Cómo le fue (cita textual si la hay):

== B. OPERACIÓN (insumo del BPMN) ==
Cómo entra el trabajo:
Cómo sale el trabajo:
Dónde se atasca:
Quién hace qué:
Qué pasa cuando algo sale mal:

== C. DINERO PERDIDO (lo más importante) ==
Cifra mensual mencionada:
Cómo la calculó o de dónde sale:
Cita textual del cliente sobre la pérdida:
Otras pérdidas mencionadas sin cifra:

== D. SISTEMAS Y CONECTIVIDAD ==
Software contable / facturación:
Otras herramientas (Excel, WhatsApp, papel, ERP):
Calidad de internet donde ocurre el proceso:

== E. EQUIPO ==
Número de personas:
Rotación mencionada:
Quién sería el usuario final:
¿Hay alguien técnico? (sí / no / no se mencionó):

== F. FINANCIAMIENTO ==
Recursos propios o fondo público:
¿Ha postulado antes? ¿Se adjudicó?:
Instrumento mencionado (Sercotec, CORFO, otro):
¿Abierto a piloto propio + fondo después?:

== ARREGLOS INMEDIATOS DETECTADOS ==
Lista solo lo que el propio cliente describió como duplicado, innecesario o
que nadie usa. No propongas mejoras tuyas.

== COMPROMISOS Y FECHAS ==
Visitas acordadas (a quién, cuándo):
Datos que el cliente quedó de preparar:
Fecha comprometida del informe:

== CITAS DESTACADAS ==
Las 3 frases más reveladoras del cliente, textuales.

[TRANSCRIPCIÓN]
```

---

## ⚠️ EL PASO 4 NO ES OPCIONAL

**Revisa siempre la ficha contra tu memoria de la reunión.**

Un modelo local puede equivocar una cifra, confundir quién dijo qué, o
transcribir mal un monto. En el bloque C eso es grave: **esa cifra sostiene toda
la propuesta** y va a aparecer en la cotización que le entregas al cliente.

Regla simple: **ninguna cifra pasa a la cotización sin que tú la hayas
confirmado**, sea escuchando el tramo del audio o preguntándole de nuevo.

---

## PARA QUÉ SIRVE DESPUÉS

| Bloque | Va a |
|---|---|
| B — Operación | ARQUITECTO, para armar el BPMN |
| C — Dinero perdido | La cotización y el semáforo (D-3: bajo $150.000/mes se descarta) |
| D, E | Validar R-3, R-6, R-13, R-14 y el tramo de precio |
| F | FINANCE, con el marcador PARTICULAR / PÚBLICO-ADJUDICADO / EN-POSTULACIÓN |
| Arreglos inmediatos | La sección del informe de Fase 1 |
| Compromisos | Tu WhatsApp de confirmación el mismo día |

Ver [GUIA-PRIMERA-ENTREVISTA-CLIENTE.md](GUIA-PRIMERA-ENTREVISTA-CLIENTE.md).

---

## SOBRE EL AUDIO

Se borra al entregar el informe **si el cliente lo pidió** al dar el permiso.
Mientras exista, no sale del PC ni se sube a ningún servicio: hay un NDA
firmado de por medio.

---

*Herramientas: Whisper large-v3 (local) + Hermes en LM Studio (local)*
