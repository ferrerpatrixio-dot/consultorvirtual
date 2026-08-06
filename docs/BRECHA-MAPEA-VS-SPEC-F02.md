# Brecha: Mapea (generador-bpmn) vs. spec F02 — Análisis de arquitectura

**Autor:** ARQUITECTO IT
**Fecha:** 2026-08-05
**Insumo:** `sistemaaiprocess/sdd/features/F02/spec.md` (23 CA), código real de `generador-bpmn/`
**Alcance de este doc:** gap analysis, priorización, decisiones de arquitectura y sizing del primer incremento. NO decide si conviene implementar F02 (ya decidido por Patricio) ni modela el proceso de negocio.

---

## 1. Qué existe hoy en `generador-bpmn`

Motor lineal de 3 capas, sin ciclos de revisión:

1. `extraccion-llm.ts` — prompt libre → JSON (`actores[]` + `pasos[]`), un solo `output_config: json_schema`, valida con Zod, sanea referencias rotas (`siguiente*` inválido → se descarta + `pending_questions`). **No hay reglas de completitud por severidad**, solo "¿el LLM dejó una duda?".
2. `diagramas.ts` — modelo de datos plano: `Paso { id, actor, tipo, texto, siguiente, siguienteSi, siguienteNo }`. Seis tipos fijos. Sin `lane` separado de `actor` en el tipo persistido (aunque el LLM lo produce, se descarta al normalizar). Sin campos de documento, control, entradas/salidas.
3. `exportar-bpmn.ts` — construye árbol `bpmn-moddle` + `bpmn-auto-layout`. Exporta **solo `.bpmn`**. Limitación confirmada en spike: `bpmn-auto-layout` no dibuja los recuadros de `Lane` (el dato semántico queda bien, el render visual no marca carriles).
4. `actions.ts` — edición nivel 1 completa (actor/tipo/texto/destinos, agregar/quitar/mover paso) vía server actions directas sobre Prisma. **Sin versionado**: cada `update` sobrescribe el `Json` del diagrama, no hay historial ni diff.
5. Editor: paneles de edición existen (confirmado por vos como ya construido), pero sin instrucción localizada por IA (nivel 2 de la spec).

---

## 2. Tabla de brecha por sección de la spec

| Sección spec | Existe hoy | Estado | Qué falta construir |
|---|---|---|---|
| **§3.1 Generar + lista revisable** | Genera directo a `pasos[]`, sin lista previa de confirmación | Parcial | Paso intermedio "lista revisable" antes de persistir; hoy el LLM ya escribe en BD |
| **§3.2 Completitud (A1-A5, E1/E1b, E2/E3, M1-M4)** | Nada — solo detección ad hoc de destinos rotos vía `pending_questions` (texto libre del LLM, no reglas de código) | **No existe** | Motor de reglas determinístico en TypeScript, corre sobre el JSON (no sobre el LLM — Artículo 3). Necesita clasificar severidad y decidir bloqueo/marca/exportación |
| **§3.3 Coherencia con SIPOC (S1-S3)** | No existe F01/SIPOC en el sistema todavía | **No existe** — pero spec dice explícitamente que no bloquea sin F01 | Nada urgente; diseñar el modelo de datos de `Paso` ya pensando en que después habrá `entradas`/`salidas` declaradas, para no tener que migrar feo cuando llegue F01 |
| **§3.4 Tope de tamaño + descomposición** | Sin tope. Un prompt de 200 actividades se procesa igual | **No existe** | Conteo de nodos tras generar, comparación contra 50, propuesta de corte (UI + lógica de agrupamiento en subprocesos) |
| **§3.5 Corrección 3 niveles + versionado** | Nivel 1 (edición directa) **sí existe**, funcional, sin IA — coincide con CA-4. Nivel 2 y 3: no hay instrucción localizada por IA con preview de cambios | Parcial (nivel 1 completo, nivel 2 ausente) | Versionado (tabla `DiagramVersion` o similar, diff, restaurar) — hoy CERO historial, cualquier edición pisa el estado anterior sin rastro. Instrucción localizada nivel 2 con preview "se agregará X, se moverá Y" antes de aplicar |
| **§3.6 Cuatro formatos** | Solo `.bpmn` | Parcial (1 de 4) | SVG, PDF A3 apaisado (diagrama + tabla), HTML autocontenido con pan/zoom. El SVG es la base de PDF y HTML — conviene resolverlo primero |
| **§3.7 Documentos y controles (dos capas)** | El modelo `Paso` no tiene campo de documento ni de control | **No existe** | Campos nuevos en `Paso` (documentos hito, marca de control con anotación/convención de nombre, no solo color), tabla de actividades separada del diagrama |
| **§7 Seguridad (RS-1 a RS-6)** | RS-1 ya se cumple de hecho: hoy la única entrada es texto libre del propio usuario autenticado (`messages: [{role:"user", content: descripcion}]`), no hay entrada por archivo todavía. RS-3 (escape de strings) no está verificado explícitamente en el export actual. RS-4 (XXE) no se ha revisado en `bpmn-moddle`/`bpmn-auto-layout`. RS-2 parcial (Zod valida, pero es post-parseo JSON, no validación de esquema BPMN antes de renderizar) | Parcial | Ver §5 de este doc — la mayoría de RS-1/RS-5/RS-6 **no aplican todavía** porque no hay entrada por archivo (§2 "NO entra" del alcance actual del incremento recomendado). RS-3 y RS-4 sí aplican ya, incluso sin archivos, porque el texto libre del propio usuario ya puede contener `<script>` o payloads XML |

---

## 3. Priorización — orden de implementación

Criterio: valor para el usuario que ya usa el producto, riesgo técnico de dejarlo para después, y dependencia entre piezas. No es la secuencia de la tabla del punto 2 (esa es por sección de spec, no por orden de build).

**Incremento 0 (ya construido, no se toca):** generación básica + edición nivel 1 + export `.bpmn`.

**Incremento 1 — el que recomiendo construir ahora:**
1. **Motor de reglas de completitud (§3.2)**, versión reducida: A1, A2, A3, M1, M2, M3, E2, E3. Dejo fuera E1/E1b (depende de declarar entradas/salidas por actividad, que hoy no existen en el modelo — sería agregar dos campos nuevos a `Paso` antes de poder evaluar la regla) y M4/A5 (M4 se resuelve en el incremento 2 junto con el tope; A5 es solo "sugerencia", bajo valor).
2. **Endurecer RS-3 y RS-4** de una vez, porque son baratos y ya aplican con la superficie actual (texto libre): escapar todo string al serializar XML/HTML, confirmar que el parser no resuelve entidades externas.
3. **Lista revisable antes de dibujar (§3.1)**, reutilizando el resultado del motor de reglas del punto 1: se muestra `actores + pasos + huecos por severidad`, el usuario confirma, recién ahí se persiste.

**Por qué esto primero y no versionado ni exportación:** el motor de completitud es la pieza que hace que el producto deje de mentir — hoy un diagrama se genera y exporta aunque tenga una compuerta sin condición o una actividad inalcanzable, y nadie se entera. Es además la pieza de la que dependen después el bloqueo de exportación (§3.2) y el resaltado de campos en el panel (CA-15) — construirla primero evita retrabajo. Versionado y multi-formato son valiosos pero no cambian la confiabilidad del entregable; se pueden vivir sin ellos una vuelta más.

**Incremento 2:** tope de tamaño + descomposición (§3.4, depende de tener ya el conteo de nodos que el motor de reglas produce como subproducto) + reglas E1/E1b (una vez que el modelo tenga entradas/salidas).

**Incremento 3:** versionado (§3.5 nivel 3) + instrucción localizada nivel 2 con preview.

**Incremento 4:** exportación a SVG/PDF/HTML (§3.6) + documentos/controles (§3.7) — depende de tener el modelo semántico ya estabilizado (documentos y controles son campos nuevos en `Paso`, mejor agregarlos una sola vez, no en dos incrementos separados).

**Fuera de todo lo anterior, explícitamente pospuesto:** §3.3 (coherencia SIPOC) porque no hay F01 construido — no hay nada contra qué validar. Entrada por archivo (PDF/imagen) y por lo tanto RS-1/RS-5/RS-6 completos, porque hoy Mapea solo recibe texto tecleado por el propio suscriptor autenticado.

---

## 4. Decisiones de arquitectura previas a codear

La spec marca 3 `[SUPUESTO]` en su §9. Los reviso contra lo que Mapea ya construyó:

1. **"El JSON semántico es la fuente de verdad única."** — Mapea **ya** implementa exactamente esto: `Paso[]` en la BD es la fuente, `.bpmn` es un render vía `layoutProcess()`. **Aplica sin cambios.** No hay decisión que tomar: ya está tomada y es consistente.

2. **"Las correcciones nivel 2 son operaciones sobre el modelo, no reescritura completa."** — Hoy no existe nivel 2, así que no hay nada que reconciliar. **Decisión a tomar antes de construir el incremento 3:** el nivel 2 debe generar una lista de operaciones tipadas (ej. `{op: "insertar_paso", despues_de: "p3", actor: "...", texto: "..."}`) que el código aplica sobre el `Paso[]` existente — nunca pedirle al LLM que devuelva el array completo de nuevo. Esto es coherente con cómo ya está armado `actions.ts` (mutaciones puntuales tipo `agregarPasoAction`), así que es extender el patrón existente, no inventar uno nuevo.

3. **"`bpmn-auto-layout` soporta carriles, pools y subprocesos."** — **Esto es FALSO para carriles, ya verificado en un spike documentado en el propio código** (`exportar-bpmn.ts` líneas 17-33): la librería no dibuja el recuadro visual de `Lane`, aunque el dato semántico (`laneSet`/`flowNodeRef`) sí queda correcto en el XML. Este supuesto de la spec **no se cumple hoy** y hay que decidir qué hacer antes de tocar §3.4 (descomposición) o cualquier exportación visual (SVG/PDF/HTML), porque los tres dependen de layout correcto:
   - Opción A: aceptar la limitación — el `.bpmn` es semánticamente correcto (CA-1 se cumple, abre bien en Camunda/bpmn.io) pero sin separación visual de carriles hasta que la herramienta externa lo relayoutee. Barato, pero no cumple del todo la intención de "carriles por responsable" que pide §2.
   - Opción B: postprocesar el XML para agregar manualmente los `bpmndi:BPMNShape` de cada `Lane` con bounding boxes calculados a partir de las coordenadas que ya puso `bpmn-auto-layout` para los nodos de ese actor. Es factible (los datos de posición ya existen) pero es trabajo de geometría no trivial, y el propio código advierte que un cálculo ingenuo produce carriles rotos porque el layout no posiciona por carril.
   - Opción C: evaluar `bpmn-auto-layout@2.0.0-alpha` u otra librería de layout que sí soporte lanes, aceptando el riesgo de una versión no estable.
   - **Mi recomendación:** Opción A para el incremento 1-2 (no bloquea nada del `.bpmn`), reabrir con un spike corto de DEV recién cuando se llegue al incremento 4 (SVG/PDF/HTML), porque ahí sí el carril visible importa para que el gerente lea el PDF. No es una decisión que haya que cerrar hoy.

---

## 5. Sizing del incremento 1 recomendado

**T-shirt: M** (comparable en esfuerzo a un módulo de validación de negocio con \~8 reglas + cambio de flujo de UI, no a una integración externa nueva).

Desglose:
- Motor de reglas de completitud (8 reglas, determinístico, sobre `Paso[]` ya en memoria): **S-M**. Es lógica pura, sin dependencias nuevas, se prueba con casos fijos (coincide con CA-14, determinismo).
- Lista revisable pre-persistencia: requiere un paso intermedio en el flujo actual (hoy `generarDesdePromptAction` persiste directo) — pantalla nueva + estado transitorio (no en BD hasta confirmar) + acción de confirmar: **S-M**.
- Escapado XML/HTML + verificación XXE: **S**, es acotado y ya hay superficie de código donde tocar (`exportar-bpmn.ts`, más el HTML de incremento 4 cuando exista — por ahora solo aplica al `.bpmn`).
- Bloqueo de exportación cuando hay pendientes sin resolver: **S**, un chequeo antes de servir el endpoint de exportación.

Timeline: **DEV confirma**, no lo comprometo yo. Como referencia de orden de magnitud (mismo criterio que usé en Fase 5 Mercado Pago): esto es más chico que esa fase — sin integración externa, sin dinero de por medio, sin webhook. Diría rango de días, no semanas, pero la cifra exacta la valida DEV.

---

## 6. Riesgo técnico

### 6.1 Validador 7PMG determinístico — ¿viable en código?

**Sí, es viable como reglas de código para las guías que la spec ya operacionalizó (G1, G3, G4, G6, G7)** — de hecho la tabla §3.2/§6 de la spec ya las tradujo a reglas contables sobre el grafo (contar nodos, verificar un solo inicio/fin, verificar apertura=cierre de compuerta, contar salidas por nodo). Esto es aritmética sobre un grafo, no juicio: no hace falta IA para evaluarlo, y la spec es explícita en que **debe** ser código (Artículo 3), no la IA.

**Riesgo real, no en la codificación sino en la fuente:** la propia spec (§6) trae una advertencia sin resolver — la numeración exacta de las guías 7PMG y el dato empírico del umbral de 50 nodos están citados de memoria de la conversación previa, no verificados contra el paper original (Mendling, Reijers & van der Aalst, 2010). Ya hay un error detectado ahí mismo (se citó descomposición como G6, corresponde a G7). **No recomiendo escribir código de validación contra una numeración no verificada.** Es una tarea de investigación corta (leer el paper o un resumen confiable), no de arquitectura, pero bloquea con seguridad razonable antes de que DEV escriba las 7 reglas con el nombre/orden correcto — si no, hay riesgo de tener que renombrar constantes y docs después. Sugiero que quede como tarea explícita de `metodologo-bpm` antes del incremento que toque G1-G7 completo (no bloquea el incremento 1, que solo usa 3 de las 7 guías y ya están bien identificadas: un inicio/un fin, compuerta abre=cierra, tope de nodos).

### 6.2 RS-1 a RS-6 — ¿aplican hoy a Mapea?

**Parcialmente, y esto es más importante de lo que parece.** El razonamiento de la spec (§7) es que el riesgo de inyección indirecta viene de que "el insumo puede ser un archivo" de un tercero no autenticado. Hoy Mapea **no tiene entrada por archivo** — coincide con tu lectura. Pero:

- **RS-1 (aislar dato de instrucción) y RS-5 (aislamiento entre proyectos del mismo dueño) y RS-6 (límite de tamaño del insumo)** — correctamente pospuestos junto con la entrada por archivo. Hoy el único insumo es texto que el propio suscriptor autenticado escribe sobre su propio proyecto; el riesgo que motiva estas tres reglas no existe todavía. **No las construiría en el incremento 1.**
- **RS-3 (escapar todo string del modelo en los 4 formatos) y RS-4 (XXE)** — **estas SÍ aplican ya, incluso sin archivos**, porque el propio suscriptor puede escribir `<script>` o comillas en el nombre de una actividad, y eso hoy va derecho a `moddle.create(..., { name: p.texto })` sin escape verificado. Es exactamente CA-22, y es barato de cerrar ahora en `exportar-bpmn.ts`. Lo incluí en el sizing del incremento 1 por eso — no porque haya archivos, sino porque el mismo bug existe con texto tecleado por un usuario legítimo que sin querer usa un carácter raro, o con mala intención igual de barata de ejecutar.
- **RS-2 (validar contra esquema antes de renderizar)** — hoy hay validación Zod post-parseo del LLM, pero no hay una validación de "esquema BPMN" antes de convertir a XML — el árbol se construye directo con `bpmn-moddle`. Es de menor urgencia porque `bpmn-moddle` en sí mismo rechaza estructuras inválidas al construir el árbol (falla al crear el elemento), pero no es lo mismo que un chequeo explícito con mensaje claro al usuario (CA-23). Puede esperar al incremento 2-3.

**Conclusión de riesgo:** no hace falta investigar más para decidir esto — la lectura de la spec es correcta y aplicable hoy sin ambigüedad. El único punto que merece más trabajo antes de codear es la numeración 7PMG (§6.1), que es investigación de una fuente académica, no arquitectura de software.

---

## Resumen ejecutivo

**Primer incremento a construir:** motor de reglas de completitud determinístico (subset de 8 reglas de §3.2) + lista revisable previa a persistir + bloqueo de exportación con pendientes + escapado XML/verificación XXE (RS-3/RS-4, ya aplicables sin espera). **Sizing: M**, timeline a confirmar por DEV.

**Hallazgo de riesgo más importante:** dos cosas separadas, ninguna bloqueante para arrancar. (1) La numeración y el umbral empírico de 7PMG citados en la spec no están verificados contra la fuente original — tarea de investigación corta antes de que DEV codifique las 7 reglas completas, no antes del incremento 1. (2) El supuesto de la spec de que `bpmn-auto-layout` soporta carriles es **falso**, ya confirmado por un spike propio documentado en el código: la librería no dibuja los recuadros de `Lane` aunque el dato semántico queda correcto. No bloquea el `.bpmn` (CA-1 se cumple igual), pero sí hay que decidirlo antes de construir SVG/PDF/HTML (incremento 4), donde el carril visible sí importa.
