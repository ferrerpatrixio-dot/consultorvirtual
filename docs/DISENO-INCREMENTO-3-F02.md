# Incremento 3 de F02 — Integridad del grafo y desbloqueo de la exportación

**Autor:** ARQUITECTO-IT
**Fecha:** 2026-08-07
**Estado:** propuesta — requiere visto bueno de PMcoordinador; DEV valida timeline
**Antecedentes:** `docs/BRECHA-MAPEA-VS-SPEC-F02.md` (Incremento 1),
`docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md` (Incremento 2),
`docs/METODOLOGIA-JERARQUIA-MAPEA.md` (roadmap de niveles),
revisión de campo del ANALISTA-PROCESOS-NEGOCIO (casos QA-01 a QA-20).

---

## 0. Resumen ejecutivo

Mapea tiene hoy un motor de reglas que **bloquea la exportación ante cualquier hueco
`pendiente`** y, al mismo tiempo, **no detecta el error de datos más grave que puede tener
un diagrama**: un destino que apunta a un paso que no existe. El resultado combinado es el
peor de los dos mundos — el sistema frena al usuario por cosas discutibles (heurísticas) y
lo deja pasar en la única cosa que no es discutible (el grafo está roto).

El Incremento 3 corrige exactamente eso. No agrega ninguna funcionalidad nueva de producto:
cierra la deuda de correctitud del motor y le devuelve al usuario el control sobre los
avisos que el motor no puede resolver por él. Es el incremento más barato del backlog y el
de mayor impacto por peso, y es prerrequisito de cualquier feature que dependa de que el
diagrama exportado sea fiel (Reporte de Riesgo, Nivel 1, Nivel 4).

Sizing total: **M** (≈2-3 días DEV). Cero migraciones destructivas, una columna nueva.

---

## 1. Priorización del backlog acumulado

Criterio, el mismo de los incrementos 1 y 2: **primero lo que hace que el producto mienta**,
después lo que hace que el producto trabe, después lo que agrega valor nuevo. Una feature
grande no entra a un incremento sin su propio documento de diseño.

### 1.1 Entra al Incremento 3 (barato + alto impacto)

| # | Ítem | Origen | Por qué entra | Sizing |
|---|---|---|---|---|
| 1 | Regla de **destino inexistente** | Revisión ARQUITECTO Inc.1 | Es el único caso donde el `.bpmn` entregado al cliente **es distinto** de lo que el usuario modeló, sin ninguna señal. Todo lo demás es "falta información"; esto es "la información está mal y te la borramos". | S |
| 2 | **Reconocer pendiente** para destrabar exportación | Revisión ARQUITECTO Inc.1 | Ya no es hipotético: verifiqué el código y hay una contradicción real en producción (§2.3). Sin esto, un diagrama de >50 nodos es inexportable, contra la intención declarada del propio Incremento 2. | M |
| 3 | **M1: unicidad** de inicio/fin (QA-13) | Analista | Arreglo trivial sobre código que ya existe, caso cotidiano documentado. | S |
| 4 | **Actor genérico** (QA-05, "Sistema" / "Área" / "Responsable") | Analista | Lista cerrada de términos, sin NLP, severidad `sugerencia` — no puede generar falso bloqueo. | S |

### 1.2 Necesita su propio diseño antes de que DEV toque nada

| # | Ítem | Por qué no entra ahora | Qué falta |
|---|---|---|---|
| 5 | **QA-09 — decisiones de 3+ ramas** | Es un cambio de modelo de datos que atraviesa `Paso`, el schema Zod, `mermaid-render`, `exportar-bpmn`, el motor (M2 y M3 asumen exactamente dos ramas), el editor de pasos y el prompt de extracción. Sizing **L**. Meterlo junto a arreglos S sería repetir el error de mezclar deuda con feature. | Documento propio (`DISENO-INCREMENTO-4-F02-RAMAS-N.md`). **Dato nuevo, verificado:** `src/lib/extraccion-llm.ts:51` ya instruye al LLM a modelar 3+ ramas como cadena de decisiones binarias. O sea, la mitigación existe y es metodológicamente válida en BPMN. Eso cambia la pregunta: antes de cambiar el modelo hay que decidir con el ANALISTA si la cadena binaria es aceptable como salida de consultoría o si el cliente exige el gateway de N salidas. **Escalo esa decisión, no la tomo solo.** |
| 6 | **Versionado / undo** | El riesgo subió con Inc.1 y volvió a subir con Inc.2 (confirmado: `Diagram.pasosBackup` es un parche de un solo uso, solo para descomposición). Un historial real implica decidir granularidad, retención y costo de storage. Sizing **M-L**. | Documento propio. Mitigación parcial ya en producción vía `pasosBackup`; el Incremento 3 **baja la presión** sobre este riesgo porque reduce las ediciones forzadas para destrabar la exportación. |
| 7 | **Reporte de Riesgo y Fricciones** | No hay spec técnica, solo metodología de negocio. Además es la feature de la que depende el pricing de dos tiers: construirla mal es caro dos veces. | Spec funcional del ANALISTA + definición de tiers de PRODUCT MANAGER. Hasta entonces DEV no debe tocarlo. |
| 8 | **Nivel 1 (Diagrama de Valor) y Nivel 4 (Procedimientos)** | Nivel 1 no es el mismo objeto de datos que un proceso (no tiene flujo de control ni carriles); Nivel 4 es texto estructurado, no diagrama. Ninguno de los dos cabe en el modelo `Diagram` actual sin decidir antes si son entidades nuevas. | Documento de modelo de datos de la jerarquía completa. |

### 1.3 Queda esperando un insumo externo

| # | Ítem | Espera a |
|---|---|---|
| 9 | Diccionario de verbos de proceso (A1/A2 fino) | Validación del ANALISTA-PROCESOS-NEGOCIO como metodólogo. Es riesgo puro de falso positivo: hoy A2 es `pendiente` y `pendiente` bloquea la exportación, así que **cada falso positivo es un cliente trabado**. No se toca hasta tener el diccionario revisado por una persona. (El Incremento 3 reduce el daño de este riesgo, ver §2.3.) |
| 10 | Actores duplicados por similitud (QA-06) | Mismo motivo: "Bodega" vs "Almacén" no es distancia de edición, es sinonimia. Una heurística de similitud tipo Levenshtein marcaría "Bodega"/"Bodeguero" y no marcaría "Bodega"/"Almacén" — o sea, fallaría justo en el caso que el analista reportó. Requiere criterio, no algoritmo. |
| 11 | E1/E1b (completitud de entradas/salidas) | Los campos existen en `Paso` desde Inc.2, pero el LLM no los extrae y nadie los carga a mano. Construir la regla hoy es construir una regla que marca el 100% de los pasos. Espera a que la extracción los pueble. |

---

## 2. Qué construye DEV — alcance del Incremento 3

### 2.1 Regla M5 — destino inexistente (bloqueante)

**El bug, verificado en código.** `src/lib/exportar-bpmn.ts`, función `crearFlow`:

```ts
if (!origen || !destino) return; // destino roto/inexistente: se omite, igual que generarMermaid
```

`src/lib/mermaid-render.ts:94-98` hace lo mismo en el preview. Y el motor de completitud
lo sabe y lo dejó anotado como deuda (`src/lib/completitud.ts`, comentario de `destinosDe`:
*"La validación de que un id inexistente es en sí mismo un error de datos queda para
incremento 2"* — no se hizo en el 2, se hace en el 3).

Consecuencia hoy: el `.bpmn` sale con una flecha menos, el preview también, y como
`destinosDe()` filtra los ids fantasma, **el resto del motor tampoco lo ve** — E2/E3/M3
evalúan un grafo distinto del que el usuario declaró. Nadie se entera en ningún punto de
la cadena.

**Especificación.**

- Nueva regla `M5`, severidad **`bloqueante`**. Es la severidad correcta y no admite
  discusión: no es "falta información", es "el dato es inválido". No se puede reconocer
  (ver §2.3).
- Se evalúa sobre los tres campos: `siguiente`, `siguienteSi`, `siguienteNo`.
- Condición: el campo tiene valor no vacío **y** ese valor no está en el conjunto de ids
  de pasos del diagrama.
- Un hueco por cada destino roto (un paso de decisión con las dos ramas rotas genera dos).
- Mensaje: `` `El paso "X" apunta a un destino que ya no existe en el diagrama (rama "Sí").` ``
  — nombrar la rama solo cuando es una decisión.
- `pasoId` = el paso **origen** (es el que hay que editar; el destino no existe, no se puede
  resaltar).

**Nota de implementación para DEV:** `destinosDe()` **no se modifica**. Su filtrado de ids
fantasma es correcto y ya está justificado en su comentario (evita que dos ramas
"converjan" en la nada y engañen a M3). M5 es una regla nueva e independiente que lee los
campos crudos del `Paso`. Son dos responsabilidades distintas y deben quedar separadas.

**Causa raíz a cubrir con test.** El caso realista no es un dato corrupto: es
`quitarPasoAction` en `src/app/(app)/actions.ts` — se borra un paso y los pasos que le
apuntaban quedan colgando. DEV debe verificar si esa acción limpia las referencias
entrantes. **Si no las limpia, hay dos arreglos y ambos entran:**
1. `quitarPasoAction` limpia las referencias a ese id en el resto de los pasos (deja el
   campo vacío → cae en M2/E3, que sí son bloqueantes y guían al usuario).
2. M5 igual se construye, como red de seguridad para los datos ya existentes en producción
   que hayan quedado rotos por este camino.

Sizing: **S**.

### 2.2 M1 — unicidad de inicio y de fin (QA-13)

Hoy `completitud.ts` verifica `pasos.some(p => p.tipo === "inicio")`, es decir que **exista**,
no que sea **único**. La guía 7PMG G3 que la propia regla cita dice "un solo inicio y un solo
fin". El caso del analista es cotidiano: *"arranca cuando llega el correo, o cuando llama el
cliente"* → dos eventos de inicio, cero marcas.

**Especificación.**

- Se mantiene el bloqueante actual cuando **no hay** inicio / no hay fin.
- Se agrega, con la misma regla `M1`, severidad **`pendiente`**:
  - más de un paso `tipo === "inicio"` → *"El diagrama tiene N eventos de inicio. Un proceso
    debería tener uno solo: si arranca por varias vías, modela un inicio único y las
    variantes como una decisión posterior."*
  - más de un paso de fin (`fin_ok` + `fin_error` combinados) → **no se marca.** Múltiples
    fines con resultado distinto (OK vs error) son modelado correcto y frecuente; marcarlos
    sería ruido. **Solo se marca cuando hay más de un `fin_ok`**, que sí suele ser el mismo
    fin dibujado dos veces.

`pendiente` y no `bloqueante`: hay procesos que legítimamente tienen dos disparadores, y
convertir eso en bloqueo dejaría al usuario sin salida. Con el mecanismo de §2.3 puede
reconocerlo y seguir.

Sizing: **S**.

### 2.3 Reconocimiento de pendientes — el desbloqueo

**Esto ya no es preventivo. Hay una contradicción en producción, verificada.**

`src/lib/completitud.ts` justifica que M4 (más de 50 nodos) sea `pendiente` y no
`bloqueante` con este comentario textual:

> *"la spec §3.4 permite seguir con un diagrama único asumiendo la advertencia — bloquear
> del todo cerraría esa puerta."*

Pero tres líneas más abajo, `tienePendientesSinResolver()` devuelve `true` ante cualquier
`pendiente`, y tanto `diagramas/[id]/page.tsx:64` como
`api/diagramas/[id]/exportar/route.ts:35` bloquean la exportación con esa función.
**Resultado: hoy un diagrama de 51 nodos no se puede exportar de ninguna manera, y el
usuario no tiene ninguna acción disponible que lo destrabe** — salvo borrar pasos o
descomponer, que es precisamente lo que el comentario dice que no queremos forzar.

El mismo problema aplica a M3 (falso positivo estructural en procesos con loop), a A2
(texto de una palabra) y ahora a M1-múltiple-inicio (§2.2).

**Especificación.**

*Modelo de datos.* Una columna nueva en `Diagram`:

```prisma
/// Incremento 3: claves de huecos `pendiente` que el usuario declaró
/// aceptar a sabiendas, para destrabar la exportación. Array de strings
/// con el formato `${regla}:${pasoId ?? "-"}`. Nunca contiene huecos
/// `bloqueante` — el server los rechaza (ver reconocerHuecoAction).
huecosReconocidos Json @default("[]")
```

Migración aditiva con default, sin backfill, sin riesgo sobre datos existentes.

*Clave estable.* Se exporta desde `completitud.ts`:

```ts
export function claveHueco(h: Hueco): string {
  return `${h.regla}:${h.pasoId ?? "-"}`;
}
```

Un solo lugar que define la clave, consumido por el server action, la página y el route
handler de exportación. Que sea derivada (y no un id generado) es deliberado: el motor es
determinístico, así que la misma condición produce siempre la misma clave, y un hueco que
el usuario resuelve de verdad simplemente deja de aparecer — su clave queda huérfana en el
array, sin efecto. **Limitación aceptada y documentada:** si el usuario reconoce un hueco,
edita el paso y el hueco vuelve a aparecer por otro motivo bajo la misma regla, sigue
reconocido. Es preferible a la alternativa (invalidar reconocimientos en cada edición), que
devolvería al usuario al mismo callejón del que este mecanismo lo saca.

*Regla de negocio — no negociable.*

- Solo se pueden reconocer huecos de severidad **`pendiente`**.
- Un `bloqueante` **nunca** se reconoce. El server action valida la severidad recalculando
  los huecos desde cero, no confía en lo que llega del formulario — mismo criterio de
  defensa que ya usa `confirmarDiagramaGeneradoAction`.
- **M5 es bloqueante, por lo tanto un grafo roto sigue siendo inexportable.** Este
  mecanismo abre la puerta a las heurísticas discutibles, no a los errores de datos. Es la
  razón por la que §2.1 y §2.3 tienen que ir en el mismo incremento: uno sin el otro
  desbalancea el criterio.

*Cambio en la lógica de bloqueo.* `tienePendientesSinResolver` pasa a recibir el array de
reconocidos:

```ts
export function tienePendientesSinResolver(
  huecos: Hueco[],
  reconocidos: string[] = [],
): boolean {
  const set = new Set(reconocidos);
  return huecos.some(
    (h) =>
      h.severidad === "bloqueante" ||
      (h.severidad === "pendiente" && !set.has(claveHueco(h))),
  );
}
```

Parámetro con default para no romper llamadas existentes ni tests. Los dos call sites
(`page.tsx`, `exportar/route.ts`) pasan `parseReconocidos(diagrama.huecosReconocidos)`.
**El route handler de exportación tiene que aplicar la misma lógica que la página** — si
solo se arregla la UI, el endpoint sigue devolviendo 4xx y el botón habilitado falla.

*Server actions.* `reconocerHuecoAction` y `desreconocerHuecoAction` en
`src/app/(app)/actions.ts`, ambas con `requireUser()` y `where: { id, userId }` como el
resto de las acciones del archivo.

*UI.* La lista de huecos ya existe en `page.tsx:147-165`. DISEÑADOR-UX define la forma
final; desde el stack lo que hace falta es:
- en cada ítem de severidad `pendiente` no reconocido, una acción "Lo asumo, exportar igual";
- el ítem reconocido se muestra atenuado, con la etiqueta "asumido por ti" y la acción
  inversa para revertir;
- los `bloqueante` no muestran ninguna acción de reconocimiento.

El texto de la acción importa y es de DISEÑADOR-UX: esto no es "ignorar un error", es "el
consultor asume una decisión de modelado". Se está firmando algo, y debería sentirse así.

Sizing: **M**.

### 2.4 Actor genérico (QA-05) — sugerencia

`A3` hoy solo detecta actor **vacío**. Un paso con actor `"Sistema"` pasa limpio, aunque no
identifica a ningún responsable real — que es justo el hueco que la consultoría necesita
cerrar.

**Especificación.**

- Nueva regla `A4`, severidad **`sugerencia`** (no bloquea, no necesita reconocerse).
- Lista cerrada, comparación case-insensitive sobre el actor normalizado sin acentos, match
  **exacto** contra la lista (no `includes`: "Sistema de Bodega" es un actor legítimo y no
  debe marcarse):
  `sistema`, `el sistema`, `area`, `el area`, `responsable`, `el responsable`,
  `encargado`, `el encargado`, `usuario`, `el usuario`, `otro`, `varios`, `n/a`,
  `por definir`.
- Mensaje: *"El responsable del paso «X» es genérico («Sistema»). Identifica el rol o el
  área concreta: es lo que permite después asignar la mejora a alguien."*

Sizing: **S**. La lista queda como constante exportada, para que el ANALISTA pueda
ampliarla sin tocar lógica.

### 2.5 Tests (QA)

Los cuatro puntos son código puro y determinístico en `completitud.ts` — el mismo patrón de
`completitud.test.ts` que ya existe. Casos mínimos exigidos:

- M5: destino roto en `siguiente`; en `siguienteSi`; en ambas ramas (2 huecos); destino
  válido (0 huecos); paso de fin sin destino (0 huecos).
- M5 + borrado: borrar un paso referenciado y verificar el estado resultante (según lo que
  DEV encuentre en `quitarPasoAction`, §2.1).
- M1: dos inicios → 1 pendiente; dos `fin_ok` → 1 pendiente; un `fin_ok` + un `fin_error`
  → **0 huecos** (este test protege la decisión de §2.2 de una "mejora" futura).
- Reconocimiento: pendiente reconocido → exporta; bloqueante "reconocido" (payload
  manipulado) → **sigue bloqueado**; M5 reconocido → sigue bloqueado.
- A4: `"Sistema"` → sugerencia; `"Sistema de Bodega"` → 0 huecos; `"SISTEMA"` → sugerencia.

**Pedido explícito a QA, que quedó abierto del Incremento 1:** además de los unitarios, hay
que probar **end to end en la UI** el ciclo completo "hueco pendiente → reconocer →
descargar `.bpmn`". La brecha que este incremento arregla existió porque el motor se probó
unitariamente y el bloqueo de exportación nunca se ejercitó desde la pantalla.

---

## 3. Qué queda explícitamente fuera del Incremento 3

- Decisiones de 3+ ramas (QA-09) — Incremento 4, con documento propio y decisión previa de
  metodología (§1.2 ítem 5).
- Versionado / historial / undo general — documento propio.
- Reporte de Riesgo y Fricciones — sin spec técnica, DEV no lo toca.
- Nivel 1 y Nivel 4 de la jerarquía — sin modelo de datos definido.
- E1/E1b — espera a que el LLM extraiga entradas/salidas.
- Diccionario de verbos (A1/A2 fino) y actores duplicados por similitud (QA-06) — esperan
  criterio del ANALISTA.
- Cualquier cambio en el prompt de extracción LLM.
- Cualquier cambio en `descomposicion.ts`.

---

## 4. Riesgos

| Riesgo | Sev. | Mitigación |
|---|---|---|
| M5 marca como bloqueantes diagramas **ya guardados** en producción con destinos rotos, y esos usuarios quedan trabados de golpe. | 🟠 Alta | Es el comportamiento correcto (el diagrama estaba roto y se estaba exportando mal), pero es un cambio visible sin aviso. **Antes de deployar, DEV corre un script de solo lectura sobre `Diagram` y cuenta cuántos diagramas tienen al menos un destino roto.** Si el número es material, PM decide si hace falta comunicación al usuario. Escalo la decisión de comunicación, no la tomo. |
| El reconocimiento se usa como "botón de saltar todo" y baja la calidad de la salida. | 🟡 Media | Solo aplica a `pendiente`; los bloqueantes (incluido M5) siguen firmes. Trazabilidad: queda registrado en el diagrama qué asumió el usuario, insumo directo para el futuro Reporte de Riesgo. |
| Cambiar la firma de `tienePendientesSinResolver` rompe un call site en silencio. | 🟡 Media | Son 2 call sites, ambos listados en §2.3. El default del parámetro conserva el comportamiento anterior (más estricto, nunca menos) — un call site olvidado bloquea de más, no de menos. |
| Versionado sigue sin construirse mientras suben las ediciones. | 🟡 Media | Este incremento **reduce** las ediciones forzadas (el usuario reconoce en vez de reeditar). Aun así queda como candidato firme a Incremento 4/5. |

---

## 5. Sizing y secuencia

| Bloque | Sizing | Depende de |
|---|---|---|
| §2.1 M5 destino inexistente + limpieza en `quitarPasoAction` | S | — |
| §2.2 M1 unicidad | S | — |
| §2.4 A4 actor genérico | S | — |
| §2.3 Reconocimiento de pendientes (migración + actions + UI + route) | M | Texto de UI de DISEÑADOR-UX (no bloquea el backend) |
| §2.5 Tests | S | los anteriores |

**Total: M.** Estimación gruesa 2-3 días de DEV. **El timeline lo confirma DEV, no yo.**

Orden sugerido: §2.1 → §2.2 → §2.4 (motor puro, todo en un archivo, testeable de
inmediato) → §2.3 (toca schema y UI) → §2.5.

---

## 6. Validaciones pendientes antes de cerrar

- **DEV:** ¿ejecutable en el sizing? ¿`quitarPasoAction` limpia hoy las referencias
  entrantes? ¿ETA?
- **DISEÑADOR-UX:** texto y forma de la acción de reconocimiento — no puede leerse como
  "ignorar el error".
- **SECURITY:** sin impacto en Ley 19.628 a mi juicio — la columna nueva no guarda dato
  personal, solo claves de reglas. Confirmación de trámite.
- **ANALISTA-PROCESOS-NEGOCIO:** ¿la cadena de decisiones binarias es salida aceptable para
  QA-09, o el cliente exige gateway de N salidas? De esa respuesta depende el sizing del
  Incremento 4.
- **PATRICIO / PM:** decisión sobre comunicación a usuarios si el script de §4 encuentra
  diagramas rotos en producción.
