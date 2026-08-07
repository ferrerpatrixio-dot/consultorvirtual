# Versionado e historial de diagramas (F02 §3.5 nivel 3)

**Autor:** ARQUITECTO-IT
**Fecha:** 2026-08-07
**Estado:** propuesta de diseño. NO implementada. DEV construye después del visto bueno de PMcoordinador.
**Antecedentes:**
`docs/BRECHA-MAPEA-VS-SPEC-F02.md` (Incremento 1, en producción),
`docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md` (Incremento 2, en producción),
`docs/DISENO-INCREMENTO-3-F02.md` (Incremento 3, en producción).

**Nota de numeración:** el plan original (`BRECHA...` §3) reservaba el rótulo "Incremento 3"
para versionado + instrucción localizada nivel 2. Ese número terminó usándose para integridad
de grafo y reconocer-pendiente. **Este documento reemplaza esa entrada del plan.** Para evitar
otra colisión no le pongo número: se llama **Versionado**. La instrucción localizada nivel 2
con preview, que en el plan original venía en el mismo paquete, **queda explícitamente fuera**
(§8) — el versionado es su prerrequisito, no su compañero.

---

## 0. Resumen ejecutivo

Hoy toda mutación de un diagrama en Mapea es un `prisma.diagram.update` que sobrescribe el
`Json` de `pasos`. **No queda rastro del estado anterior.** Verificado en código
(`src/app/(app)/actions.ts`): las nueve acciones mutadoras —`actualizarMetaAction`,
`agregarActorAction`, `quitarActorAction`, `agregarPasoAction`, `actualizarPasoAction`,
`moverPasoArriba/AbajoAction`, `quitarPasoAction`, `reconocer/desreconocerHuecoAction`,
`descomponerEnSubprocesoAction`— escriben directo, sin historial. La única mitigación existente
es `Diagram.pasosBackup`, un campo de un solo uso que solo cubre "deshacer la descomposición
que creó este hijo".

El riesgo escaló tres veces: el Incremento 1 empuja al usuario a editar más (para destrabar la
exportación), el Incremento 2 introdujo la primera operación **destructiva de segundo orden**
(borrar un paso `subproceso` hace `prisma.diagram.delete` del hijo, línea 483 de `actions.ts`,
sin confirmación de UI), y el Incremento 3 sumó estado mutable nuevo (`huecosReconocidos`).

Este diseño propone: **tabla `DiagramVersion` con snapshot completo, escrita como imagen previa
en la misma transacción de cada mutación, con coalescencia por ventana de tiempo y retención de
las últimas N versiones.** Alcance del primer corte: ver historial y restaurar. Diff visual:
segundo corte. **Sizing total del primer corte: M.**

Y una conclusión que hay que leer aparte: **el versionado NO resuelve por sí solo el borrado en
cascada de subprocesos.** Ese riesgo necesita dos cosas más, ambas baratas, ambas en §5.

---

## 1. Modelo de datos

### 1.1 Decisión: snapshot completo en tabla separada. Descartado el diff incremental.

```prisma
model DiagramVersion {
  id        String   @id @default(cuid())
  diagramId String
  userId    String   // denormalizado: permite autorizar sin join al Diagram
  seq       Int      // 1, 2, 3... monotónico por diagrama. Es lo que ve el usuario.
  createdAt DateTime @default(now())

  // Qué operación produjo el estado que ESTA versión reemplazó (etiqueta de UI)
  operacion String   // "editar_paso" | "agregar_paso" | "quitar_paso" | "mover_paso" |
                     // "editar_actores" | "editar_meta" | "descomponer" |
                     // "reconocer_hueco" | "restaurar" | "generacion_inicial"
  detalle   String?  // ej. texto del paso tocado, para "Se editó «Aprobar factura»"

  // Snapshot completo del estado ANTERIOR a la operación (imagen previa)
  actores           Json
  pasos             Json
  huecosReconocidos Json
  cliente           String
  proceso           String

  diagram Diagram @relation(fields: [diagramId], references: [id], onDelete: Cascade)

  @@unique([diagramId, seq])
  @@index([diagramId, createdAt])
  @@schema("generador_bpmn")
}
```

**Por qué snapshot completo y no diff:**

1. **El volumen no lo justifica.** Cuenta real sobre el modelo actual: un `Paso` serializado
   pesa ~150–250 bytes (id cuid, actor, tipo, texto, hasta tres destinos). Un diagrama en el
   tope de G7 son 50 pasos ≈ **10 KB de JSON**. Con retención de 50 versiones eso da **~500 KB
   por diagrama en el peor caso**, y el caso típico de PYME (15–20 actividades, decenas de
   ediciones, no miles) está en torno a **100 KB**. Sobre el plan de Supabase que ya usamos
   compartido con `sistemaaiprocess`, esto es ruido. Optimizar storage acá sería resolver un
   problema que no tenemos.
2. **El diff cuesta caro en el lado correcto de la balanza.** Un historial por diffs obliga a
   reconstruir el estado replicando la secuencia desde el origen: cualquier bug en una operación
   de replay corrompe **todas** las versiones posteriores, y el bug se descubre meses después,
   justo cuando el usuario necesita restaurar. El snapshot es idempotente: restaurar es un
   `update` con un `Json` literal, imposible de "aplicar mal".
3. **El modelo ya es un blob.** `pasos` es una columna `Json`, no filas normalizadas. Un diff
   estructural sobre un blob es trabajo extra sin beneficio de consulta.

**Descartado también:** array de versiones dentro del propio `Diagram` (una columna
`versiones Json[]`). Haría que cada lectura del diagrama —que ocurre en cada render de
`/diagramas/[id]`— arrastre todo el historial. Tabla separada, se consulta solo cuando el
usuario abre el panel de historial.

### 1.2 Qué pasa con `pasosBackup`

**Se elimina y se absorbe.** No queda como caso especial.

`Diagram.pasosBackup` existe (schema línea 142) declarado en su propio comentario como parche
provisorio "mientras no exista versionado real". Mantener dos mecanismos de deshacer con
semánticas distintas es exactamente el tipo de duplicación que después nadie sabe cuál manda.
`descomponerEnSubprocesoAction` ya guarda ahí el `pasos` del padre previo al corte — que es,
literalmente, una imagen previa. Pasa a ser una fila `DiagramVersion` con
`operacion: "descomponer"`, igual que todas las demás.

**Migración:** una migración de datos que, por cada `Diagram` con `pasosBackup != null`, cree
una `DiagramVersion` con `seq = 1`, `operacion = "descomponer"` y ese contenido — apuntando al
**diagrama padre**, no al hijo (hoy el backup vive en el hijo, que es donde no corresponde
semánticamente: es el estado previo del padre). Después, `DROP COLUMN pasosBackup`. Son pocas
filas y la conversión es mecánica. Si DEV prefiere no arriesgar la conversión, la alternativa
aceptable es dejar la columna huérfana sin uso y borrarla en una limpieza posterior; lo que
**no** es aceptable es que las dos vías queden vivas a la vez.

### 1.3 Qué NO se versiona en este corte

- **El árbol completo.** Una versión es de **un** `Diagram`. Restaurar el padre no restaura el
  contenido interno de sus hijos (sí gestiona su existencia, §5). Versionar el árbol como unidad
  atómica exigiría un concepto de "commit multi-diagrama" que hoy no hace falta: las mutaciones
  actuales tocan un diagrama a la vez, con la única excepción de descomponer y de quitar un paso
  subproceso — ambas cubiertas en §5.
- **La generación inicial por LLM.** El `seq 0` implícito es el estado con que nació el diagrama;
  no hace falta versionar el prompt. Si en algún momento se quiere "volver a lo que generó la IA",
  sale gratis: es la versión más antigua retenida, siempre que no haya sido podada (§4).

---

## 2. Qué dispara una versión nueva

### 2.1 Decisión: toda mutación, con coalescencia por ventana

Evalué las dos alternativas del encargo:

| Opción | Qué implica | Por qué |
|---|---|---|
| **A · Solo puntos de control explícitos** (confirmar generación, aplicar descomposición, cerrar el editor de un paso) | Menos filas, menos storage | **Descartada.** Obliga a definir a mano qué es "control" y a mantener esa lista sincronizada con cada acción nueva que agregue DEV. La primera acción que alguien olvide anotar es un agujero silencioso en el historial — el mismo tipo de bug que ya nos pasó con `quitarPasoAction`. Y el ahorro que compra es de kilobytes. |
| **B · Toda mutación, con coalescencia** | Un helper que envuelve las nueve acciones | **Recomendada.** El comportamiento correcto es el *default*: si DEV agrega una acción y usa el helper, queda versionada; si no lo usa, se detecta en revisión de código porque el helper es el único camino a `prisma.diagram.update`. |

**Regla de coalescencia (lo que evita el ruido de UX, que es el problema real, no el storage):**

> No se crea una versión nueva si la última versión del diagrama cumple las tres cosas:
> (a) tiene menos de **5 minutos**, (b) misma `operacion`, y (c) mismo `detalle`
> (mismo `pasoId` afectado).

Justificación de UX: un usuario que corrige el texto de un paso y toca "guardar" cuatro veces
en dos minutos no quiere cuatro entradas en su historial, quiere una — la de antes de empezar a
tocar ese paso. La imagen previa que se conserva es la **primera** de la ráfaga, que es
exactamente el punto al que querría volver. Y `moverPasoArriba/Abajo` es el caso extremo:
reordenar una tabla de 20 pasos puede ser 15 clics; sin coalescencia serían 15 versiones sin
ningún valor informativo.

**Excepciones que nunca coalescen** (siempre crean versión propia, aunque sean consecutivas):
`quitar_paso`, `descomponer`, `restaurar`. Son las tres operaciones destructivas o de gran
alcance: acá el usuario quiere un punto de retorno preciso, no agrupado.

### 2.2 Implementación que le pido a DEV

Un único helper en `src/lib/versionado.ts`:

```ts
export async function mutarDiagramaVersionado(
  tx: Prisma.TransactionClient,
  diagrama: Diagram,                  // estado ACTUAL, ya leído y autorizado
  operacion: OperacionVersion,
  detalle: string | undefined,
  cambios: Prisma.DiagramUpdateInput, // lo que hoy va directo al update
): Promise<void>
```

Hace, **en una sola `$transaction`**: (1) evalúa coalescencia, (2) si corresponde inserta la
`DiagramVersion` con la imagen previa y `seq = max(seq)+1`, (3) aplica el `update`, (4) poda si
excede la retención (§4).

Puntos que DEV no puede resolver solo y quedan definidos acá:

- **`seq` se calcula dentro de la transacción**, no con un contador en memoria. La `@@unique([diagramId, seq])`
  es la red de seguridad ante dos pestañas del mismo usuario editando a la vez: la segunda
  transacción falla y reintenta. Un usuario mono-tenant hace esto poco, pero el costo de la
  constraint es cero.
- **Se versiona la imagen previa, no la posterior.** Así el estado actual del diagrama nunca está
  duplicado en la tabla de versiones, y "restaurar la versión N" significa literalmente "volver a
  como estaba antes de la operación N".
- **`descomponerEnSubprocesoAction` mantiene su `$transaction` actual** y suma la inserción de
  versión adentro. No se anidan transacciones.

---

## 3. Qué puede hacer el usuario

### 3.1 Primer corte (mínimo viable): historial + restaurar completo

**Historial.** Panel lateral o pestaña en `/diagramas/[id]`, lista descendente:

```
Hoy 14:32   Se quitó el paso «Validar stock»                 [Ver] [Restaurar]
Hoy 14:20   Se descompuso en subproceso «Cotización»         [Ver] [Restaurar]
Hoy 11:05   Se editó el paso «Aprobar factura»               [Ver] [Restaurar]
Ayer 17:40  Diagrama generado                                [Ver] [Restaurar]
```

La etiqueta se arma de `operacion` + `detalle`. **El copy exacto lo define DISEÑADOR-UX**; yo
solo garantizo que el dato para construirla está en la fila.

**Ver.** Renderiza el diagrama de esa versión en modo lectura, reutilizando `mermaid-render.ts`
sin cambios (recibe `pasos`, no le importa de dónde salieron). Sin edición, sin exportación.

**Restaurar.** `restaurarVersionAction(diagramId, versionId)`:

1. Autoriza (diagrama del usuario) y valida que la versión pertenece a ese diagrama.
2. **Crea una versión nueva con el estado actual** (`operacion: "restaurar"`) antes de pisar nada.
   Consecuencia deliberada: **restaurar nunca destruye, y por lo tanto el "deshacer el deshacer"
   sale gratis** — es restaurar la versión que acaba de crearse. No hay que construir un redo.
3. Reconcilia subprocesos (§5.2) — **este es el paso que no es trivial**.
4. Escribe `actores`/`pasos`/`huecosReconocidos`/`cliente`/`proceso` de la versión destino.
5. Reevalúa completitud con el motor existente. No hace falta guardar los huecos: se recalculan
   siempre (CA-14, determinismo). Sí se restaura `huecosReconocidos`, que es decisión del usuario,
   no cálculo.

**Lo que el usuario NO puede hacer en este corte:** restaurar un paso suelto de una versión
anterior sin restaurar el resto. Es tentador y es una feature distinta (cherry-pick), con su
propio problema de referencias colgantes. Fuera de alcance.

### 3.2 Segundo corte: diff visual

Comparar dos versiones y mostrar qué cambió. Tres niveles de ambición, sizing distinto:

| Nivel | Qué muestra | Sizing | Comentario |
|---|---|---|---|
| **D1 · Diff de lista** | Tabla de pasos con filas marcadas: agregado / eliminado / modificado (y qué campo). Es un `Map` por `paso.id` entre dos arrays. | **S** | Lógica pura, testeable con casos fijos. **Es el que recomiendo si se hace diff.** |
| **D2 · Diff sobre el diagrama** | El render Mermaid de la versión nueva con nodos coloreados por estado del diff | **M** | Requiere pasar clases de estilo por nodo al render. Factible, no gratis. |
| **D3 · Vista lado a lado sincronizada** | Dos lienzos con pan/zoom acoplado | **L** | Nada que ver con el problema que estamos resolviendo. **No lo recomiendo.** |

**Recomendación: el primer corte NO lleva diff.** El valor del 80% está en "volver a como estaba",
y el diff sin restaurar no salva a nadie. Si el usuario pide "ver qué cambié", D1 se agrega
después sin tocar nada del modelo de datos — la tabla de versiones ya tiene todo lo necesario.
Diseñarlo ahora y construirlo después no cuesta nada extra, que es justamente el punto.

---

## 4. Retención y costo

**Regla: se conservan las últimas 50 versiones por diagrama.** Al insertar la número 51, se borra
la más antigua, en la misma transacción.

- 50 versiones × ~10 KB (diagrama en el tope de G7) = **~500 KB por diagrama en el peor caso**.
  El caso PYME típico está bajo 150 KB.
- 50 es holgado para el patrón de uso real (un diagrama se arma en una o dos sesiones de trabajo,
  no se edita durante meses) y acotado para el peor caso.
- **Sin retención por tiempo.** Un diagrama editado hace seis meses y no tocado desde entonces
  debe conservar su historial: borrar por antigüedad castiga justo al usuario que dejó el trabajo
  terminado. El límite por cantidad ya acota el costo.
- La poda es la única operación que borra historial. **Nunca la dispara el usuario** — no hay
  "borrar historial" en la UI, porque su único uso realista es destruir evidencia de un error
  propio y no le sirve a nadie.

**Costo total estimado:** con 100 diagramas activos en el peor caso, ~50 MB. No mueve la aguja
del plan de Supabase actual, ni cambia nada del costo de la API de Claude (el versionado no llama
al LLM ni una vez). **No hay compromiso de presupuesto nuevo en esta propuesta.**

---

## 5. Interacción con el borrado en cascada de subprocesos

**Este es el punto que más importa del documento, y la respuesta a la pregunta del encargo es:
NO, el versionado no lo resuelve solo. Hacen falta las tres cosas de abajo.**

### 5.1 Por qué el versionado solo no alcanza

Verificado en `actions.ts` líneas 481-488: `quitarPasoAction` ejecuta
`prisma.diagram.delete({ where: { id: pasoEliminado.subprocesoDiagramId } })`. Es un **borrado
físico de otra fila**, que además dispara `onDelete: Cascade` sobre todos los nietos.

Si versionamos solo el padre, restaurar esa versión reinstala un `Paso` con
`tipo: "subproceso"` y un `subprocesoDiagramId` que **apunta a una fila que ya no existe**. El
resultado sería peor que el estado actual: un diagrama que se ve bien, con un nodo "+" que al
hacer clic da 404, y una `CallActivity` exportada con `calledElement` colgante. Recrearíamos, en
otro lugar, exactamente el bug de "destino inexistente" que el Incremento 3 acaba de cerrar.

### 5.2 Las tres piezas, y por qué ninguna reemplaza a las otras

**(a) Borrado lógico del subárbol — habilita que restaurar funcione de verdad.**

```prisma
model Diagram {
  // ...
  deletedAt DateTime?   // borrado lógico
  @@index([userId, deletedAt])
}
```

`quitarPasoAction` deja de hacer `delete` sobre el hijo y pasa a marcar `deletedAt` en el hijo y
en todo su subárbol. Todas las consultas de listado y de carga filtran `deletedAt: null` — esta
es la parte que hay que hacer con disciplina, es donde se cuela el bug. `restaurarVersionAction`
entonces sí puede revivir (`deletedAt: null`) los hijos que la versión destino referencia.

Los hijos con borrado lógico se purgan físicamente cuando su versión más nueva que los
referenciaba sale por la poda de retención (§4) — o sea, un hijo se vuelve irrecuperable recién
cuando ninguna versión conservada lo menciona. Es la única regla de purga y es derivable, no
configurable.

**(b) Reconciliación al restaurar — reglas explícitas, no comportamiento emergente.**

Comparar el conjunto de `subprocesoDiagramId` de la versión destino (V) contra el actual (A):

| Caso | Situación | Qué hace |
|---|---|---|
| En V y en A | El subproceso sobrevivió | Nada. |
| **En V, no en A** | El hijo fue borrado después | Si existe con `deletedAt != null` → **revivir el subárbol**. Si fue purgado → **degradar el paso a `tipo: "tarea"`** conservando el texto, y avisar al usuario en el mismo aviso de resultado: *"el subproceso «X» ya no se puede recuperar; el paso quedó como actividad"*. Nunca dejar el enlace colgante. |
| **En A, no en V** | El hijo se creó después de la versión destino | **Borrado lógico, nunca físico.** Queda recuperable restaurando hacia adelante. |

**Lo importante de esta tabla no es cada regla, es que sean tres y estén escritas.** Sin esto,
DEV improvisa una y produce datos inconsistentes que nadie ve hasta que un cliente exporta.

**(c) Confirmación de UI en el momento — sigue siendo obligatoria, independiente del historial.**

**Sí, la confirmación se construye igual, y no es redundante.** Tres razones:

1. **Un undo disponible no es lo mismo que un aviso previo.** El usuario que borra un paso
   `subproceso` sin saber que arrastra 12 pasos del hijo no va a ir al historial a buscar lo que
   no sabe que perdió. Descubre el daño días después, cuando exporta para el cliente.
2. **La confirmación entrega información que el historial no puede dar a tiempo:** *"esto elimina
   también el subproceso «Cotización» y sus 12 pasos"*. El conteo se calcula en el momento; en el
   historial es arqueología.
3. Es **S** y ya estaba comprometido: es literalmente el riesgo #3 del Incremento 2
   (`DISENO-INCREMENTO-2...` §6.3), que quedó sin construir.

**Recomendación de secuencia:** la confirmación de UI (c) es **S** y no depende de nada de este
diseño. Si por lo que sea el versionado se posterga otra vez, **(c) se construye igual, sola y
ya** — es la mitigación más barata de la operación destructiva que hoy está viva en producción.

---

## 6. Sizing

**T-shirt total del primer corte: M.** Un escalón por debajo del Incremento 2 (M-L). Hay
migración de BD, pero es **aditiva** (tabla nueva + una columna `deletedAt`), no cambia el modelo
semántico de `Paso`, y no toca ni el motor de completitud, ni el render, ni la exportación.

| Pieza | Sizing | Nota |
|---|---|---|
| Migración: tabla `DiagramVersion` + `Diagram.deletedAt` | **S** | Aditiva. Sin backfill salvo lo de `pasosBackup`. |
| Migración de datos `pasosBackup` → `DiagramVersion` + `DROP COLUMN` | **S** | Pocas filas, conversión mecánica. |
| Helper `mutarDiagramaVersionado` + coalescencia + poda | **M** | Pieza central. Toda la lógica delicada (seq, transacción, retención) vive acá y se testea acá. |
| Enganchar las 9 acciones mutadoras al helper | **S** | Mecánico, pero **exige revisión de que no quede ninguna suelta**. |
| Borrado lógico + filtrado `deletedAt: null` en todas las consultas | **S-M** | El sizing está en la disciplina de no olvidar una consulta, no en la dificultad. |
| Panel de historial (lista + "Ver" en modo lectura) | **S-M** | Reutiliza `mermaid-render.ts` sin cambios. |
| `restaurarVersionAction` + reconciliación de subprocesos (§5.2) | **M** | La pieza de mayor riesgo de datos. Tests obligatorios de los tres casos de la tabla. |
| Confirmación de UI del borrado en cascada | **S** | Independiente. Se puede adelantar. |
| *(Segundo corte)* Diff D1 de lista | **S** | No entra al primer corte. |

**Timeline: lo confirma DEV, no lo comprometo yo.** Referencia de orden de magnitud con el mismo
criterio de los incrementos anteriores: más que el Incremento 3 (M, ≈2-3 días), menos que el
Incremento 2. Rango de días, no de semanas. La cifra la valida DEV.

**Si hay que recortar,** el orden en que yo sacaría cosas:
1. El "Ver" en modo lectura (la lista con etiquetas + restaurar ya sirve; ver es comodidad).
2. La migración de `pasosBackup` (dejar la columna huérfana y limpiarla después) — **solo si DEV
   la considera riesgosa**, y con la condición de que la vía vieja quede desconectada.
3. **Lo que NO se recorta:** la reconciliación de subprocesos (§5.2). Sin ella el versionado
   produce datos rotos, que es peor que no tener versionado.

---

## 7. Riesgos y decisiones que escalo

**1. Concurrencia de dos pestañas.** Hoy no hay ninguna protección: dos pestañas editando el
mismo diagrama pisan el trabajo la una de la otra sin aviso, versionado o no. El versionado
**no lo arregla, pero lo hace recuperable** (el trabajo pisado está en el historial) y la
`@@unique([diagramId, seq])` lo hace al menos detectable. Un bloqueo optimista de verdad
(comparar `updatedAt` al escribir) es **S** adicional. **No lo meto en este corte** — es un
problema distinto, y el producto es mono-usuario. Queda registrado.

**2. `deletedAt` y el cupo de trial.** `User.trialDiagramsCreated` solo sube y nunca baja
(`src/lib/trial.ts`), así que el borrado lógico **no abre ningún agujero nuevo** en el trial:
un usuario no puede borrar y recrear para recuperar cupo, ni antes ni después de este cambio.
Verificado. **Sin impacto comercial, no requiere decisión de PRODUCT MANAGER.**

**3. Ley 19.628 / retención de datos personales — para SECURITY.** Las versiones conservan texto
libre que el usuario escribió, y ese texto puede contener nombres de personas (los actores de un
proceso suelen ser cargos, pero nada impide "Juan de Contabilidad"). Hoy borrar un diagrama borra
todo por `onDelete: Cascade`, y eso se mantiene: `DiagramVersion` cuelga del `Diagram` con
cascada, y borrar el `User` arrastra todo. **Punto a confirmar con SECURITY:** que el borrado
lógico (`deletedAt`) de un subproceso **no** cuente como conservación indebida — mi lectura es que
no, porque el titular del dato es el propio suscriptor que sigue teniendo el diagrama activo, y la
purga por retención ocurre igual. Pero es criterio de compliance, no mío. **No bloquea el diseño;
sí conviene resolverlo antes de que esto llegue a producción.**

**4. La coalescencia de 5 minutos es un número que elegí yo.** Es una decisión de UX, no de
arquitectura. Si DISEÑADOR-UX prefiere otro valor (o coalescencia por "sesión de edición" en vez
de por reloj), el helper lo soporta cambiando una constante. **No es bloqueante.**

---

## 8. Explícitamente fuera de alcance

- **Instrucción localizada nivel 2 con preview (F02 §3.5 nivel 2).** Iba junto al versionado en el
  plan original. La separo: es una feature de IA con su propio riesgo (operaciones tipadas
  generadas por LLM, ver `BRECHA...` §4.2), y el versionado es su **prerrequisito** —
  no quiero que un LLM aplique operaciones sobre el modelo sin que exista undo. Documento propio,
  después de este.
- **Diff visual** (§3.2) — segundo corte.
- **Cherry-pick de un paso desde una versión anterior** (§3.1).
- **Versionado del árbol como unidad atómica** (§1.3).
- **Bloqueo optimista de concurrencia** (§7.1).

---

## Resumen ejecutivo

**Modelo:** tabla `DiagramVersion` con **snapshot completo** (`actores`/`pasos`/`huecosReconocidos`/
`cliente`/`proceso`) como imagen previa. Diff incremental descartado: el volumen no lo justifica
(~10 KB por versión en el peor caso) y el replay de diffs introduce una clase de bug que corrompe
el historial entero en silencio. **`pasosBackup` se elimina y se absorbe** — dos mecanismos de
deshacer conviviendo es peor que ninguno.

**Disparo:** **toda mutación**, vía un helper único que es el único camino a `diagram.update`, con
**coalescencia de 5 minutos** para misma operación sobre el mismo paso (evita 15 versiones por
reordenar una tabla). Nunca coalescen: quitar paso, descomponer, restaurar. Retención: **últimas
50 versiones**, poda por cantidad, no por tiempo.

**Alcance de usuario, primer corte:** ver historial + restaurar versión completa. Restaurar crea
versión del estado actual antes de pisar, así que el redo sale gratis y nada se destruye. **Diff
visual queda para un segundo corte** (D1 de lista, **S**, sin tocar el modelo de datos).

**Cascada de subprocesos:** el versionado **no la resuelve solo**. Hacen falta tres piezas:
(a) borrado **lógico** del subárbol en vez del `delete` físico actual, (b) reglas explícitas de
reconciliación al restaurar —revivir / degradar a `tarea` si fue purgado / borrar lógico el hijo
sobrante—, y (c) **la confirmación de UI sigue siendo obligatoria e independiente**: un undo
disponible no reemplaza al aviso previo, porque el usuario no busca en el historial lo que no sabe
que perdió. La confirmación es **S** y no depende de nada de este diseño — se puede adelantar hoy.

**Sizing: M.** Timeline lo confirma DEV.

**Nada que escalar a Patricio:** sin costo nuevo, sin decisión de producto, sin compromiso de
presupuesto. Un punto de compliance a confirmar con SECURITY (§7.3), no bloqueante.
