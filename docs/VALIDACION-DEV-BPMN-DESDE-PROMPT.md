# Validación DEV: Generador de Diagramas BPMN desde Prompt

**Autor:** DEV
**Fecha:** 2026-08-02
**Para:** PMcoordinador → Patricio Ferrer
**Relacionado:** `docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md`, sección "Decisiones de Patricio (2026-08-02)"

---

## Alcance evaluado

Esta validación toma el alcance **ya decidido por Patricio**, no el original de ARQUITECTO IT:

1. Precio: infraestructura de gating con placeholder (no bloquea desarrollo).
2. Mono-usuario, sin multi-tenant.
3. **Mercado Pago** como proveedor de pago (no Stripe).
4. Exportación: **v1 solo PNG/PDF** — `.bpmn` XML real se mueve a fase 2 post-MVP (decisión final de Patricio, ver "Preguntas resueltas" #2, revisada tras conocer el costo cuantificado).

No se escribió código de producción. Este documento es research + estimación, según el protocolo de mi rol (`.claude/agents/dev.md`, sección "Validación de factibilidad y timeline").

Antes de estimar, verifiqué el prototipo real (`apps/generador-diagramas.html`, función `generarMermaid()`, líneas 381-424) para confirmar el modelo de datos que la propuesta describe. Confirmado: cada paso tiene `id`, `actor`, `tipo` (uno de `inicio`, `tarea`, `sistema`, `decision`, `fin_ok`, `fin_error`), `texto`, y destino(s) — `siguiente` para pasos lineales o `siguienteSi`/`siguienteNo` para decisiones. Los actores generan `subgraph` (carriles). Este modelo es efectivamente plano y mapea limpio a BPMN 2.0: `inicio`→`startEvent`, `tarea`→`task`, `sistema`→`serviceTask`, `decision`→`exclusiveGateway`, `fin_ok`/`fin_error`→`endEvent`, actor→`lane` dentro de un único `Process`.

---

## Hallazgo 1: Mercado Pago para suscripciones recurrentes

**Sí existe un producto equivalente**: "Suscripciones" sobre el endpoint `/preapproval` (con o sin plan asociado — `preapproval_plan`), con frecuencia configurable (semanal/mensual/anual) y reintento automático de cobros rechazados. El SDK de Node.js (`mercadopago` en npm) es maduro y mantenido oficialmente.

**Pero hay una diferencia real frente a Stripe Billing, no solo cosmética:**

- **No existe un "Customer Portal" equivalente.** Stripe Billing da una página hospedada donde el usuario cancela o cambia su medio de pago sin que el equipo construya nada. Mercado Pago no tiene esa pieza — el estado de la suscripción se cambia llamando `PUT /preapproval/{id}` con el nuevo `status` (`cancelled`, `paused`). Esto significa que **DEV tiene que construir una página propia de autogestión** ("mi suscripción" con botón cancelar) en vez de redirigir a una URL hospedada. Esta pieza no estaba dimensionada en el sizing original porque con Stripe no hacía falta construirla.
- **Webhooks**: existen (`subscription_preapproval` para suscripciones sin plan/pago pendiente, `subscription_authorized_payment` para pagos autorizados), con estados `pending`/`authorized`/`cancelled`. El patrón de "webhook → actualizar estado en BD" es equivalente en concepto a Stripe, pero la documentación y el tooling de debugging de Mercado Pago son notablemente menos maduros que Stripe (no hay equivalente al `stripe listen`/`stripe trigger` de la Stripe CLI para simular eventos localmente), lo que en la práctica implica más tiempo de prueba manual contra el sandbox real.
- **Checkout**: sí tiene un flujo hospedado comparable (Checkout Pro / Bricks) para dar de alta la suscripción — en esto no hay brecha relevante contra Stripe Checkout.

**Conclusión:** Mercado Pago sí resuelve el problema, pero la pieza de autogestión del cliente (cancelar/actualizar medio de pago) pasa de "gratis" (redirect a portal de Stripe) a "hay que construirla". Esto es exactamente lo que la propuesta de ARQUITECTO IT ya anticipó al pedir el re-sizing de la Fase 4.

---

## Hallazgo 2: exportación a `.bpmn` XML real (movido a fase 2 — no entra en el sizing de v1)

> **Actualización:** Patricio revisó la decisión al ver el costo cuantificado (+6 días-persona,
> más el riesgo de una librería de adopción menor) y confirmó **mover esta fase a post-MVP**.
> Este hallazgo queda documentado igual porque ya está investigado y ahorra el trabajo cuando
> se retome — no se descarta, se reprioriza.

El mapeo semántico (actor/tipo/texto/destino → elementos BPMN) es directo, como se describe arriba — no es la parte riesgosa.

**La parte que casi siempre se subestima en este tipo de tarea es la capa visual (BPMNDI):** un XML BPMN 2.0 sin `bpmndi:BPMNDiagram` (coordenadas x/y/ancho/alto de cada nodo y waypoints de cada flujo) es semánticamente válido pero muchas herramientas (Camunda Modeler, bpmn.io, Signavio) lo abren en blanco o lo rechazan visualmente. Escribir ese cálculo de layout a mano (un layout engine de grafos por capas) sí sería un problema de varios días-persona y justificaría el salto de tamaño que advierte la propuesta.

**Encontré una librería que resuelve exactamente esto y reduce el riesgo:**

- **`bpmn-moddle`** (paquete oficial de la organización bpmn.io, npm, mantenido) permite construir el árbol semántico BPMN 2.0 (`Definitions`, `Process`, `Task`, `ExclusiveGateway`, `SequenceFlow`, `Lane`, etc.) programáticamente vía `moddle.create()` y serializarlo con `moddle.toXML()`. No incluye BPMNDI por sí sola.
- **`bpmn-auto-layout`** (también oficial de bpmn.io, npm, versión activa) toma BPMN XML sin información de layout y devuelve XML con el `BPMNDiagram` completo calculado automáticamente. Esto es exactamente la pieza que faltaba para no tener que escribir un layout engine propio.
- Limitación documentada de `bpmn-auto-layout`: si el XML de entrada es una colaboración con varios `participant` (pools), solo hace layout del primero. **Implicación de diseño:** conviene modelar los actores como `Lane` dentro de un único `Process`/`Participant` (que es justo el mapeo natural del prototipo, donde los actores ya son carriles de un mismo diagrama, no pools separados), no como pools independientes — así se evita chocar con esa limitación.

**Conclusión:** no hace falta escribir un serializador XML a mano ni un layout engine. La combinación `bpmn-moddle` (o incluso templating de string directo, dado lo simple y acotado del esquema) + `bpmn-auto-layout` cubre el 90% del trabajo técnico. Esto reduce el riesgo de subestimación de la Fase de XML, pero no lo elimina: `bpmn-auto-layout` es una librería relativamente nueva y de adopción menor que `bpmn-js`/`bpmn-moddle` — recomiendo un spike corto (medio día) para confirmar que el XML resultante abre correctamente en Camunda Modeler y en el visor de bpmn.io antes de comprometer el sizing de esta fase en firme.

---

## Sizing corregido por fase

Unidad: **días-persona de esfuerzo dedicado de DEV** (no días calendario — el tiempo calendario depende de la dedicación de DEV a este proyecto frente a otras líneas, eso lo define PM, ver preguntas al final).

| Fase | Contenido | Sizing propuesta original | Sizing corregido | Días-persona |
|---|---|---|---|---|
| 1. Auth + estructura Next.js + persistencia | Clonar `sistemaaiprocess/src/auth.ts`, modelo Prisma (User, Diagram), CRUD | S | **S** (sin cambio) | 3 |
| 2. Motor prompt→JSON (Claude API) + render Mermaid en React | Prompt de sistema podado de `bpmn-architect`, JSON schema, port de `generarMermaid()` a componente | M | **M** (sin cambio) | 6 |
| 3. Editor post-generación | Port de la tabla de edición a React | S | **S** (sin cambio) | 2 |
| 4. Suscripción de pago — **Mercado Pago** | Checkout, webhook, estado de suscripción en BD, middleware de gating. **Sin página propia de autogestión** — cancelar/actualizar medio de pago es gestión manual (Patricio/DEV vía dashboard de Mercado Pago), decisión de PM/Patricio del 2026-08-02 (ver "Preguntas resueltas" abajo) | M (asumía Stripe) | **M** | 5 |
| 5. Exportación a `.bpmn` XML real | Mapeo actor/tipo/texto/destino → BPMN semántico (`bpmn-moddle`), layout automático (`bpmn-auto-layout`), validación de apertura en Camunda Modeler / bpmn.io | *(no existía como fase separada; implícita en Fase 2)* | **movida a fase 2 post-MVP — no entra en v1** | 6 *(no cuenta en el total de v1)* |
| 6. QA + SECURITY (Ley 19.628) + Delivery | Mismo rigor de siempre, sobre la única superficie nueva de v1 (pagos) | S | **S** | 3 |

**Total v1: ~20 días-persona.**

Con la Fase 4 recalculada (sin la pieza de autogestión propia, resuelta como gestión manual) y la Fase 5 movida fuera de v1 (exportación XML pasa a fase 2 post-MVP — Patricio revisó la decisión al conocer el costo cuantificado), el sizing de v1 baja de los ~29 días-persona de la primera pasada a **20 días-persona**, cerca del **M** original de la propuesta de ARQUITECTO IT. La Fase 6 también baja (S en vez de S+) porque QA/SECURITY ya no auditan la superficie de exportación en v1. Los 6 días-persona de la Fase 5 quedan documentados como trabajo ya investigado para cuando se retome en fase 2 — no se pierden. Ver "Total final" al cierre del documento para la conversión a semanas calendario.

---

## Riesgos de subestimación

1. **Checkout + webhook de Mercado Pago siguen siendo la pieza más nueva y menos precedente de todo el proyecto**, aunque la cancelación ya no se construye (es manual vía dashboard, ver "Preguntas resueltas" #1). No hay nada parecido en `sistemaaiprocess` ni en ningún producto de la casa (que tampoco tiene Stripe). Recomiendo, igual que sugería ARQUITECTO IT, un spike de 1 día en sandbox de Mercado Pago (`preapproval` create + recepción de webhook) antes de comprometer la Fase 4 en firme con Patricio.
2. **Sandbox/testing de Mercado Pago es más manual que el de Stripe.** Sin un equivalente a Stripe CLI para disparar eventos de prueba localmente, gran parte del testing de webhooks va a requerir generar pagos reales de prueba contra el ambiente sandbox de Mercado Pago, lo que consume más tiempo de QA del estimado usual.
3. **`bpmn-auto-layout` es una librería de adopción menor** comparada con el resto del ecosistema bpmn.io. Bien documentada y mantenida por el mismo equipo, pero con menos superficie de uso en producción conocida que `bpmn-js`. *(No es riesgo de v1: la exportación XML se movió a fase 2. Queda documentado para cuando se retome — el spike de medio día del Hallazgo 2 sigue siendo el primer paso recomendado en ese momento.)*
4. **Costo de API de Claude por uso** (riesgo ya señalado por ARQUITECTO IT, sigue vigente): sin límite de generaciones por plan, un usuario puede erosionar margen. No es un riesgo de timeline de DEV, pero si se decide implementar un límite, agrega alcance a la Fase 1/2 (contador de uso atado al plan) que no está en este sizing.
5. **Calidad de extracción del LLM** (riesgo ya señalado, sigue vigente): mitigado por el editor post-generación, no cambia con esta re-estimación.

---

## Preguntas para PM/Patricio — RESUELTAS (2026-08-02, PM medió con Patricio)

Quedan documentadas con su decisión (no se borran, para dejar rastro de por qué el sizing cambió):

1. **¿Vale la pena reconsiderar el alcance de autogestión de suscripción para v1?** → **RESUELTO: gestión manual.** Patricio/DEV cancela o ajusta la suscripción a mano desde el dashboard de Mercado Pago. **No se construye página de autogestión propia en v1.** Impacto: Fase 4 baja de 8 a 5 días-persona (ver sizing recalculado arriba).
2. **Confirmar si la exportación a `.bpmn` XML sigue siendo un requisito firme de v1** dado que sube el proyecto de M a L. → Primera respuesta: firme para v1. **Revisado y RESUELTO en definitiva: movida a fase 2 post-MVP.** Al ver el costo cuantificado (+6 días-persona, más el riesgo de una librería de adopción menor), Patricio decidió que v1 lanza solo con PNG/PDF. Impacto: Fase 5 sale del total de v1 (-6 días-persona), y la Fase 6 baja de S+ a S porque QA/SECURITY ya no auditan esa superficie en v1. La investigación (Hallazgo 2) queda documentada intacta para cuando se retome.
3. **¿El estado `fin_error` necesita semántica de error BPMN explícita** (`errorEventDefinition`)? → **RESUELTO por PM sin escalar: `endEvent` simple para v1**, sin `errorEventDefinition`. No cambia el sizing de la Fase 5.
4. **Dedicación de DEV al proyecto.** → **RESUELTO: tiempo completo hasta MVP**, prioridad sobre otras líneas salvo urgencia de cliente. Con esto, los días-persona se traducen directo a semanas calendario (ver "Total final" abajo) — no aplica factor de dilución por reparto entre líneas.

---

## Total final (alcance cerrado, para reportar a Patricio)

**Actualizado 2026-08-02 (segunda revisión):** Patricio reconsideró la pregunta 2 al ver el costo
cuantificado y movió la exportación XML a fase 2 post-MVP. Este es el número final de v1:

- **20 días-persona** de esfuerzo dedicado de DEV (v1: auth, motor prompt→JSON, editor, suscripción Mercado Pago con gestión manual, QA/SECURITY/Delivery — sin exportación XML).
- Con dedicación **tiempo completo confirmada** (pregunta 4), a razón de 5 días laborables por semana: 20 ÷ 5 = **4 semanas calendario**.
- **Recomendación de compromiso con Patricio: 4.5–5 semanas calendario**, no 4 exactas — dejo un buffer porque la Fase 4 (Mercado Pago) sigue siendo la de menor precedente interno del alcance de v1 y empieza con un spike (riesgo 1) cuyo resultado puede mover el número real. Si el spike sale limpio, 4 semanas es alcanzable; si encuentra fricción, el buffer absorbe el desvío.
- **Fase 2 post-MVP ya dimensionada y lista para retomar:** exportación `.bpmn` XML real, +6 días-persona (~1.2 semanas), con la investigación técnica (Hallazgo 2) ya hecha — no hay que volver a investigarla cuando se decida retomarla.
