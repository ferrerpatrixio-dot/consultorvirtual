# Casos de uso y esperables — Generador BPMN

**Producto:** Generador BPMN (generación de diagramas de proceso a partir de una descripción en texto)
**Fecha:** 2026-08-05
**Para quién es este documento:** para ti, como cliente. Describe qué hace el
sistema en lenguaje simple, y qué deberías esperar que pase en cada
situación — incluyendo cuando algo sale mal. Puedes usarlo para verificar el
sistema por tu cuenta después de la entrega.

---

## 1. Iniciar sesión

**Actor:** cualquier persona con una cuenta de Google.
**Precondición:** ninguna.

**Pasos:**
1. Entras al sitio.
2. Haces clic en "Iniciar sesión con Google".
3. Confirmas tu cuenta de Google.

**Resultado esperado:** quedas dentro del sistema. Si es tu primera vez, se
crea tu cuenta automáticamente; si ya tenías una suscripción activa, entras
directo a "Mis diagramas"; si no, te lleva a la pantalla de suscripción.

### Esperables

- **Caso normal:** login exitoso te lleva a "Mis diagramas" (si ya pagas) o a "Activa tu suscripción" (si no).
- **Si cancelas el login de Google:** vuelves a la pantalla inicial, sin sesión iniciada. No pasa nada más.
- **Si ya tenías sesión iniciada y vuelves a entrar al sitio:** te salta directo adentro, no te vuelve a pedir login.

---

## 2. Activar la suscripción

**Actor:** usuario ya logueado, sin suscripción activa.
**Precondición:** tener una cuenta de Google y estar logueado.

**Pasos:**
1. El sistema te lleva automáticamente a "Activa tu suscripción" apenas intentas usar cualquier función del generador.
2. Completas los datos de tu tarjeta (número, vencimiento, código de seguridad, titular, documento de identidad).
3. Haces clic en "Suscribirme".

**Resultado esperado:** quedas con suscripción activa (plan único, CLP $9.990/mes) y accedes al generador de diagramas.

### Esperables

- **Caso normal:** al confirmar el pago, entras directo a "Mis diagramas".
- **Si los datos de la tarjeta son inválidos o el pago es rechazado:** el sistema te muestra un mensaje de error explicando qué pasó (según lo que informe el banco/Mercado Pago) y te deja intentar de nuevo — no pierdes lo que ya escribiste en el formulario de suscripción.
- **Si el pago queda en un estado intermedio (pendiente de confirmación):** ves un aviso que indica el estado actual y te pide esperar un momento y recargar la página — el sistema se actualiza solo apenas Mercado Pago confirma.
- **Sin suscripción activa, no puedes crear, editar ni exportar ningún diagrama** — es el modelo de acceso del producto: login por sí solo no alcanza, hace falta el plan pagado y activo.
- **Tus datos de tarjeta nunca pasan por nuestros servidores:** los captura directamente Mercado Pago en el propio formulario (tecnología de "iframe" bancario) — nosotros nunca vemos ni guardamos el número completo, el CVV ni el vencimiento.

---

## 3. Crear un diagrama manualmente

**Actor:** usuario logueado con suscripción activa.
**Precondición:** haber activado la suscripción.

**Pasos:**
1. Desde "Mis diagramas", clic en "Nuevo diagrama".
2. Escribes el nombre del cliente y del proceso.
3. Confirmas.

**Resultado esperado:** se crea un diagrama vacío (sin actores ni pasos todavía), listo para que lo completes a mano con el editor.

### Esperables

- **Caso normal:** el diagrama queda guardado y disponible en "Mis diagramas" de inmediato, incluso vacío.
- **Si dejas "Cliente" o "Proceso" vacíos o muy cortos (menos de 2 caracteres):** el sistema no te deja continuar y te marca el campo con el error específico ("Cliente requerido", "Proceso requerido").
- **El diagrama es tuyo, y solo tuyo:** ningún otro usuario del sistema puede verlo, editarlo ni borrarlo, aunque conozca el identificador exacto.

---

## 4. Generar un diagrama con IA a partir de una descripción

**Actor:** usuario logueado con suscripción activa.
**Precondición:** haber activado la suscripción.

**Pasos:**
1. Desde "Mis diagramas", clic en "Generar con IA".
2. Escribes el nombre del cliente y del proceso.
3. Describes el proceso en tus palabras, en un cuadro de texto libre (mínimo 20 caracteres) — por ejemplo: "El distribuidor llega con el camión y presenta la documentación al guardián. El guardián revisa que esté completa; si no lo está, rechaza la entrega..."
4. Clic en "Generar diagrama con IA".

**Resultado esperado:** en unos segundos se crea el diagrama con los actores (carriles) y pasos ya identificados a partir de tu descripción, listo para revisar y ajustar.

### Esperables

- **Caso normal:** el diagrama queda con todos los actores y pasos que la IA pudo identificar en tu texto, ya guardado y navegable.
- **Si tu descripción es muy corta (menos de 20 caracteres):** el sistema te pide que la desarrolles un poco más antes de generar, sin gastar la llamada a la IA.
- **Si tu descripción deja algo ambiguo (por ejemplo, no dices qué pasa si algo sale mal en un paso):** la IA **no inventa** esa parte — te deja el destino de ese paso sin definir y te muestra, arriba del diagrama recién generado, un aviso "Esto no quedó claro — complétalo tú" con la lista exacta de las dudas, para que las resuelvas en el editor.
- **Si el motor de IA no está disponible momentáneamente** (falla de conexión, servicio caído): el sistema te avisa con un mensaje claro y no crea un diagrama a medias — puedes intentar de nuevo.
- **La IA describe el proceso tal como se lo contaste, no lo "mejora" ni le agrega pasos de control que no le pediste** (por ejemplo, no agrega reintentos automáticos ni validaciones que no describiste) — el diagrama documenta tu proceso real, no una versión idealizada.

---

## 5. Editar un diagrama (actores y pasos)

**Actor:** usuario logueado con suscripción activa, dueño del diagrama.
**Precondición:** tener al menos un diagrama creado (manual o por IA).

**Pasos — agregar un actor:**
1. Entras al diagrama.
2. En "Actores (carriles)", escribes el nombre (ej. "Bodeguero") y clic en "+ Agregar".

**Pasos — quitar un actor:**
1. Clic en la "x" junto al nombre del actor.

**Pasos — agregar un paso:**
1. En "Pasos del proceso", eliges el actor responsable, el tipo de paso (Inicio, Tarea, Tarea de sistema, Decisión, Fin OK, Fin con error), escribes el texto, y eliges a qué paso continúa el flujo.
2. Clic en "+ Agregar paso".

**Pasos — corregir una rama de una decisión:**
1. Clic en "Editar" sobre el paso de tipo Decisión.
2. Cambias a qué paso va la rama "Sí" y/o la rama "No".
3. Clic en "Guardar cambios".

**Resultado esperado:** el diagrama y su vista previa se actualizan de inmediato con cada cambio.

### Esperables

- **Agregar el mismo actor dos veces:** el sistema simplemente no lo duplica — no pasa nada, ni error ni actor repetido.
- **Quitar un actor que tiene pasos asignados:** esos pasos **no desaparecen ni quedan huérfanos** — se reasignan automáticamente al actor que quede primero en la lista (o quedan "sin actor" si ya no queda ninguno). Vas a ver el cambio reflejado en la tabla de pasos.
- **Quitar un paso al que otros pasos apuntaban como destino:** esas referencias se limpian automáticamente (quedan "sin destino") en vez de dejar una flecha rota en el diagrama.
- **Editar una decisión y dejar una rama sin destino:** se guarda igual — el diagrama simplemente no dibuja esa rama hasta que la completes.
- **Los cambios son inmediatos:** no hay un botón de "guardar todo" al final — cada acción (agregar, quitar, editar) se guarda en el momento.

---

## 6. Exportar el diagrama a un archivo BPMN (.bpmn)

**Actor:** usuario logueado con suscripción activa, dueño del diagrama.
**Precondición:** el diagrama tiene al menos un actor y un paso.

**Pasos:**
1. Entras al diagrama.
2. Clic en "Exportar XML (.bpmn)".

**Resultado esperado:** se descarga un archivo `.bpmn` con el nombre del proceso, que puedes abrir en herramientas estándar de modelado BPMN (ej. Camunda Modeler, bpmn.io).

### Esperables

- **Caso normal:** el archivo descargado es un XML BPMN 2.0 válido, con un evento de inicio, las tareas y decisiones de tu proceso, y los eventos de fin (éxito o error) tal como los definiste.
- **El archivo respeta los carriles por actor** (cada actor queda documentado como un "lane" dentro del archivo) — la información de quién hace qué se conserva aunque abras el archivo en otra herramienta.
- **Limitación conocida y documentada:** al abrir el archivo en un modelador externo vas a ver todos los pasos y sus conexiones correctamente dibujados, pero **sin los recuadros divisorios visuales de cada carril** — es una limitación de la librería de layout automático que usamos (`bpmn-auto-layout`), no de tus datos: la información de "quién hace cada paso" está completa en el archivo, solo no se dibuja el recuadro alrededor. Si tu herramienta de modelado permite reacomodar el layout, puedes agregarlos ahí manualmente.
- **Si el diagrama no tiene actores o pasos todavía:** el botón de exportar ni siquiera aparece — no hay forma de descargar un archivo vacío por error.

---

## 7. Eliminar un diagrama

**Actor:** usuario logueado con suscripción activa, dueño del diagrama.
**Precondición:** tener el diagrama abierto.

**Pasos:**
1. Clic en el botón de eliminar (junto al título del diagrama).
2. Confirmas.

**Resultado esperado:** el diagrama desaparece de "Mis diagramas" de forma permanente.

### Esperables

- **La eliminación es inmediata y definitiva** — no hay papelera ni forma de recuperarlo desde la interfaz.
- Ningún otro diagrama tuyo se ve afectado.

---

## 8. Qué pasa si tu suscripción deja de estar activa

**Actor:** usuario que tuvo suscripción activa y luego se le venció, pausó, o falló un cobro.
**Precondición:** haber tenido acceso previamente.

**Resultado esperado:** al intentar entrar a "Mis diagramas" o a cualquier diagrama, el sistema te redirige automáticamente a "Activa tu suscripción", mostrando tu estado actual (pendiente, pausada, cancelada, etc.).

### Esperables

- **Tus diagramas no se borran** cuando la suscripción deja de estar activa — quedan guardados, simplemente no puedes verlos ni editarlos hasta reactivar el pago.
- **No hay forma de crear, editar ni exportar diagramas mientras la suscripción no esté activa** — el sistema lo verifica en cada acción, no solo al entrar a la pantalla principal.
- Apenas Mercado Pago confirma un nuevo pago, el acceso se reactiva solo, sin que tengas que contactar a soporte.

---

*Elaborado por: QA · CONSULTORAVIRTUAL · Material base del Dossier de Diseño Detallado (ver `docs/SOP-DOSSIER-DISENO-DETALLADO.md`) y de la capacitación de usuarios a cargo de DELIVERY.*
