# Metodología: Jerarquía guiada para Mapea

**Autor:** ANALISTA DE PROCESOS DE NEGOCIO
**Fecha:** 2026-08-05
**Estado:** Propuesta metodológica — pendiente validación de Patricio en los puntos marcados como PREGUNTA ABIERTA
**Alcance de este doc:** metodología (qué niveles, qué entregable en cada uno, en qué orden). NO define UI/UX (rol de DISEÑADOR-UX) ni arquitectura técnica (rol de ARQUITECTO-IT).

---

## 1. Qué es el "diagrama de valor" que pide Patricio

Patricio usa "diagrama de valor" sin definirlo con precisión técnica. Hay al menos tres lecturas posibles en la literatura de gestión de procesos:

1. **Cadena de valor de Porter** (Actividades Primarias vs. Actividades de Apoyo) — es un modelo genérico de estrategia competitiva, no un mapa de procesos operativo. Es "estándar" en el sentido de que la plantilla (5 primarias + 4 de apoyo) es igual para cualquier empresa, pero rara vez es el punto de partida útil para modelar procesos de una PYME.
2. **Mapa de macroprocesos** (Estratégicos / Core-Misionales / Soporte) — es el estándar de facto en consultoría de procesos (APQC Process Classification Framework, ISO 9001, BPM CBOK). Es "bastante estándar" en el sentido de que casi cualquier PYME de servicios o comercio tiene una estructura reconocible de macroprocesos (Ventas, Operaciones/Producción, Compras, Finanzas, RRHH, Soporte/TI), con variaciones menores por rubro.
3. **Mapa de cadena de valor del cliente específico** (value stream del producto/servicio que vende esa empresa, del tipo "Cotizar → Producir → Entregar → Cobrar") — más cercano a Value Stream Mapping (Lean), más específico del rubro pero ya no "estándar" cross-industria.

**Mi lectura profesional:** dado que Patricio dice "es bastante estándar" y lo ubica como el nivel MÁS ALTO desde el cual luego se "baja de nivel" hacia procesos y subprocesos, la lectura (2) — mapa de macroprocesos por categoría (Estratégicos/Core/Soporte) — es la que mejor calza: es reconocible por rubro sin ser tan abstracta como Porter, y es el nivel natural desde el que se navega hacia procesos concretos.

**PREGUNTA ABIERTA #1 (para Patricio):** ¿"Diagrama de valor" = mapa de macroprocesos (Estratégicos/Core/Soporte), o te referís específicamente a una cadena de valor tipo Porter? La diferencia importa porque cambia qué le proponemos al usuario en la Pantalla 1 (ver sección 6). No lo asumo — lo dejo abierto tal como manda mi regla de cero invenciones.

---

## 2. Jerarquía propuesta (4 niveles)

Para el cliente objetivo de Mapea (consultor/analista independiente, PYME — no una corporación con 8 niveles de proceso), propongo **4 niveles**, sin agregar un quinto nivel de "actividad/tarea" separado del procedimiento (eso sería sobre-diseño para el segmento):

| Nivel | Qué es | Qué lo distingue del nivel de arriba | Qué lo distingue del nivel de abajo | Ejemplo |
|---|---|---|---|---|
| **1. Diagrama/Mapa de Valor** | Vista de macroprocesos de la empresa completa (Estratégicos / Core / Soporte) | Es el techo — no hay nivel más arriba | No tiene actores ni pasos operativos, solo cajas de macroproceso | "Ventas", "Operaciones", "Finanzas", "RRHH" |
| **2. Proceso** | Un macroproceso desagregado en su flujo end-to-end, con actores (carriles) | Tiene actores y flujo BPMN; el nivel 1 no | Cada paso es todavía una actividad amplia, no el detalle de "quién hace qué clic" | "Proceso de Venta" (Prospección → Cotización → Cierre → Facturación) |
| **3. Subproceso** | Un tramo del proceso que amerita su propio detalle porque es complejo, tiene múltiples decisiones, o involucra a otro equipo | Es un BPMN igual de formal que el nivel 2, pero acota el alcance a un solo tramo del proceso padre | Un paso del subproceso ya es una acción atómica ejecutable por una persona | "Subproceso de Cotización" (dentro de Proceso de Venta) |
| **4. Procedimiento** | Instrucción operativa paso a paso, en lenguaje de quien ejecuta, para un paso o grupo de pasos del subproceso (o proceso, si no hubo subproceso) | Ya no es un diagrama — es texto operativo (qué hace cada actor, con qué herramienta, en qué orden) | No hay nivel más abajo — es el entregable más granular | "Cómo cotizar un repuesto en el sistema X" |

**Nota de simplicidad:** el Nivel 3 (Subproceso) es **opcional, no obligatorio**. Muchos procesos de PYME no necesitan bajar a subproceso — el Proceso (nivel 2) ya es lo bastante simple para ir directo a Procedimiento (nivel 4). El sistema debe permitir saltar del nivel 2 al nivel 4 cuando el proceso es simple, y ofrecer el nivel 3 solo cuando el usuario (o el propio análisis) detecta que un tramo del proceso es demasiado complejo para procedimentar directamente. Forzar siempre los 4 niveles sería sobre-diseñar para un cliente PYME.

---

## 3. Dónde entran los Reportes de Riesgo y de Fricciones/Errores

**Recomendación: en el nivel Proceso y Subproceso (niveles 2 y 3), no en el nivel Diagrama de Valor (nivel 1) ni como un único reporte al final.**

Justificación:
- En el **Diagrama de Valor (nivel 1)** no hay todavía flujo, actores ni decisiones — no hay material para detectar cuellos de botella, loops sin salida o pasos sin dueño. Un "reporte de riesgo" a ese nivel sería genérico y probablemente inventado (viola la regla de cero invenciones).
- En **Proceso y Subproceso (niveles 2-3)** sí existe el material necesario: actores, decisiones, dependencias — exactamente lo que el rol ya define en su propio protocolo (cuellos de botella, pasos sin dueño, dependencias externas frágiles, puntos únicos de falla, loops sin salida, decisiones con rama sin resolver).
- Generar un reporte de riesgo separado por CADA proceso y subproceso (en vez de uno global al final) es más útil operativamente: el usuario que bajó a "Subproceso de Cotización" quiere ver el riesgo de ESE tramo, no rebuscarlo en un reporte de 40 páginas del mapa completo.
- Al final, cuando el usuario ya mapeó todos los procesos que le interesan, tiene sentido ofrecer una **vista consolidada** (agregación de los reportes por nivel) — pero esa es una vista de síntesis, no un entregable generado desde cero al final.

En el **Procedimiento (nivel 4)** no correspondería un reporte de riesgo nuevo — los riesgos de ejecución del procedimiento ya deberían estar cubiertos por el riesgo del subproceso/proceso padre. Generar riesgo a nivel procedimiento sería duplicar sin agregar valor.

---

## 4. ¿Puede un LLM proponer la primera versión del Diagrama de Valor?

**Mi criterio: sí, es razonable, pero con dos condiciones que hay que respetar para no violar "cero invenciones".**

A favor:
- El mapa de macroprocesos (Estratégicos/Core/Soporte) SÍ tiene una estructura genérica reconocible por rubro (ej. toda distribuidora tiene Compras-Logística-Ventas-Cobranza; toda empresa de servicios profesionales tiene Captación-Entrega del servicio-Facturación). Esto no es "inventar el proceso del cliente" — es aplicar un patrón de industria conocido y publicado (APQC, benchmarks sectoriales), igual que un consultor humano lo haría en la primera reunión de levantamiento, antes de validarlo con el cliente.
- Es exactamente lo que Patricio pide: "ayudar a seleccionar opciones para la primera versión, que luego el usuario puede editar" — es decir, un borrador editable, no un resultado final. Eso es coherente con nuestra propia regla: "propones, el dueño del proceso valida."

Condiciones para que no sea "invención":
1. El sistema debe **declarar explícitamente que es un borrador de plantilla por rubro**, no un levantamiento real de la empresa del usuario — igual que un diagrama con huecos declarado es útil, un borrador declarado como borrador es útil; un borrador presentado como "así es tu empresa" sin que el usuario sepa que es una plantilla genérica es peligroso (el cliente lo valida sin darse cuenta de que es una suposición).
2. El input mínimo no puede ser solo "somos una distribuidora de repuestos automotrices" sin más — con ESO el LLM puede razonablemente proponer los macroprocesos típicos del rubro "distribución/retail" (esto es benchmark de industria, no invención del proceso específico del cliente). Pero no debe inventar detalle de proceso o subproceso (nivel 2-3) a partir de una frase de una línea — ahí sí se necesita levantamiento real (entrevista, descripción del cliente), porque el detalle operativo NO es estándar entre empresas del mismo rubro.

**Conclusión:** viable y de buen criterio en el **Nivel 1 (Diagrama de Valor)** porque ahí la estructura es genuinamente estándar por rubro. Deja de ser viable — y pasa a zona de riesgo de invención — en los **Niveles 2, 3 y 4**, donde el detalle es específico de cada empresa y debe surgir del prompt/levantamiento real del usuario, no de un patrón genérico.

---

## 5. "Generar el as-is propuesto" — PREGUNTA ABIERTA #2

La frase de Patricio es ambigua entre dos lecturas:

**Lectura A:** el modelo completo (los 4 niveles) ES el as-is (proceso actual, tal como el usuario lo describe), y "propuesto" se refiere solo a que el SISTEMA lo propone/genera (a partir del prompt), en vez de que el usuario lo dibuje a mano casilla por casilla. Bajo esta lectura, no hay un quinto entregable — "as-is propuesto" es simplemente el resultado del flujo ya descrito en este documento.

**Lectura B:** además del as-is, Patricio quiere un **To-Be** (versión mejorada del proceso, con las fricciones resueltas) como entregable separado. Esto SÍ sería un quinto entregable, no contemplado hoy en los 4 entregables del rol (mapa, procedimientos, riesgos, errores).

**No resuelvo esta ambigüedad — la marco como decisión de producto pendiente.** Si es la Lectura B, tiene implicancias de alcance relevantes (quién define qué es "mejor", con qué criterio, y si el LLM propone el To-Be o solo el usuario lo edita a mano) que exceden lo que puedo decidir sin validación de Patricio.

---

## 6. Secuencia de flujo de usuario (nivel metodológico, no de UI)

1. **Entrada:** usuario describe su negocio en un prompt corto (ej. rubro + qué hace la empresa).
2. **Pantalla 1 — Diagrama de Valor propuesto:** el sistema propone un borrador de macroprocesos (Estratégicos/Core/Soporte) según patrón de industria, **etiquetado explícitamente como borrador editable**. El usuario edita (agrega, quita, renombra macroprocesos) y confirma.
3. **Punto de bifurcación — "bajar de nivel":** desde el Diagrama de Valor confirmado, el usuario selecciona UN macroproceso (ej. "Ventas") para bajar a detalle. Los demás macroprocesos quedan como cajas sin detallar hasta que el usuario decida entrar a ellos — no se generan todos los procesos de golpe.
4. **Pantalla 2 — Proceso:** a partir del macroproceso elegido, el usuario (con el prompt libre actual, el mecanismo ya validado en producción) describe el proceso real de su empresa. El sistema genera el BPMN de nivel Proceso.
5. **Punto de decisión — ¿subproceso o directo a procedimiento?:** el sistema (o el usuario) identifica si algún tramo del proceso amerita subproceso propio (complejidad, múltiples decisiones, otro equipo). Si sí, se repite el patrón de la Pantalla 2 acotado a ese tramo (Nivel 3). Si no, se pasa directo a Procedimiento.
6. **Pantalla 3 — Procedimientos:** por cada paso (o grupo de pasos) del proceso/subproceso ya modelado, el sistema genera el procedimiento operativo en lenguaje de quien ejecuta.
7. **Pantalla 4 — Reportes de Riesgo y Errores:** generados por proceso/subproceso ya modelado (no antes, ver sección 3), disponibles apenas ese nivel tiene su BPMN confirmado — no hay que esperar a terminar todo el árbol.
8. **Vista de síntesis (opcional, al final o en cualquier momento):** consolidado de todos los procesos/subprocesos ya mapeados con sus riesgos — vista de navegación, no un entregable nuevo generado desde cero.

Este orden respeta lo que pidió Patricio: "guiar al usuario para que vaya avanzando de forma ordenada en secuencia" — el sistema no permite saltar a Procedimiento sin pasar por Proceso, ni generar riesgo de algo que no fue modelado todavía.

---

## Resumen de preguntas abiertas para Patricio

1. ¿"Diagrama de valor" = mapa de macroprocesos (Estratégicos/Core/Soporte) o cadena de valor tipo Porter?
2. "As-is propuesto": ¿es solo el as-is generado por el sistema (Lectura A), o además querés un To-Be como quinto entregable separado (Lectura B)?
