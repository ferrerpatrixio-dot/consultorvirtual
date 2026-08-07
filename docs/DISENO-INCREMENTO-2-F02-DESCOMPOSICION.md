# Incremento 2 de F02 — Tope de tamaño (G7) + descomposición en subprocesos + E1/E1b

**Autor:** ARQUITECTO IT
**Fecha:** 2026-08-05
**Estado:** propuesta de diseño. NO implementada. DEV construye después de validación de PM.
**Doc previo (histórico, no se toca):** `docs/BRECHA-MAPEA-VS-SPEC-F02.md` — gap analysis y diseño del Incremento 1, ya en producción.

**Insumos cerrados que este diseño da por resueltos (no se reabren):**

1. **Umbral G7 verificado contra la fuente** (analista-procesos-negocio, 2026-08-05, contra Mendling/Reijers/van der Aalst): el tope de 50 cuenta **solo nodos** (funciones, eventos, conectores/decisiones); los arcos NO cuentan. El tope de 50 sobre el modelo `Paso` queda **confirmado sin cambios**. Detalle en `sistemaaiprocess/docs/fundamentos-teoricos.md` §3.2 y `sistemaaiprocess/sdd/features/F02/spec.md` §6/§8.
2. **Dato empírico ya citable:** en modelos de más de 50 elementos la tasa de error supera el **50%** (Mendling/Neumann/van der Aalst 2007, 2.000 EPCs de industria).
3. **Decisión de producto de Patricio (2026-08-05):** un subproceso se marca con un ícono **"+"** en el paso y al hacer clic **se abre como diagrama SEPARADO**, no colapsado inline. Cierra la pregunta abierta de `spec.md` §8. Consistente con el patrón de F07 (`docs/METODOLOGIA-JERARQUIA-MAPEA.md`). **Este doc diseña el CÓMO técnico, no discute el QUÉ.**

---

## 1. Modelo de datos: cómo se representa un subproceso

**Decisión: las dos cosas, con roles distintos y una fuente de verdad única.**

### 1.1 Nuevo tipo de `Paso` + campo de enlace

En `src/lib/diagramas.ts`:

```ts
export const TIPOS_PASO = [
  "inicio", "tarea", "sistema", "decision", "fin_ok", "fin_error",
  "subproceso",            // ← nuevo
] as const;

export type Paso = {
  id: string;
  actor: string;
  tipo: TipoPaso;
  texto: string;
  siguiente?: string;
  siguienteSi?: string;
  siguienteNo?: string;
  subprocesoDiagramId?: string;   // ← solo si tipo === "subproceso"
};
```

**Por qué tipo nuevo Y campo, y no solo un campo sobre `tarea`:**

- Tiene que ser un **tipo**, porque el nodo se comporta distinto en tres lugares independientes: se dibuja distinto (ícono "+" en el lienzo), se exporta a un elemento BPMN distinto (`bpmn:CallActivity`, no `bpmn:UserTask` — §4), y el clic abre otra pantalla en vez del panel de edición. Un `tarea` con un campo extra obligaría a un `if` disperso en cada uno de esos tres lugares, con el riesgo de que uno se olvide.
- Tiene que ser un **campo**, porque "diagrama separado enlazado" significa literalmente que el hijo es otro registro de `Diagram`. El paso padre necesita saber a cuál.
- **Regla de integridad (validar en Zod con `superRefine`):** `tipo === "subproceso"` ⟺ `subprocesoDiagramId` presente. Un paso `subproceso` sin enlace es un dato inválido, no un estado intermedio permitido.
- Un paso `subproceso` es un nodo de flujo normal en su diagrama: usa `siguiente` como `tarea`/`sistema`. Para todo el resto del motor (alcanzabilidad, callejón sin salida, carril del actor) se trata **igual que una actividad**.

### 1.2 Cambios en `prisma/schema.prisma`

```prisma
model Diagram {
  // ... campos actuales sin cambios ...
  parentDiagramId String?
  parentPasoId    String?          // id del Paso "subproceso" del padre que lo abre
  nivel           Int      @default(0)

  parent   Diagram?  @relation("Descomposicion", fields: [parentDiagramId], references: [id], onDelete: Cascade)
  children Diagram[] @relation("Descomposicion")

  @@index([parentDiagramId])
}
```

**Por qué duplicar el enlace (en el `Json` de `pasos` y en la columna `parentDiagramId`):**

- **`Paso.subprocesoDiagramId` es la fuente de verdad.** Coherente con la decisión de arquitectura ya vigente (`BRECHA...` §4.1: el JSON semántico es la fuente única, todo lo demás es render o índice).
- **`Diagram.parentDiagramId` es un índice denormalizado**, existe por tres razones que no se pueden resolver leyendo JSON: (a) borrado en cascada del árbol sin recorrer JSONs; (b) breadcrumb y navegación hacia arriba sin escanear todos los diagramas del usuario buscando quién me apunta; (c) listado de diagramas raíz (`where: { parentDiagramId: null }`) para que el hijo no aparezca suelto en la lista principal.
- **Regla operativa obligatoria para DEV:** ambos lados se escriben **en la misma transacción Prisma** (`$transaction`) en la server action de descomponer. Si divergen, gana el `Paso`. Vale un chequeo de consistencia en el `loader` del diagrama (log, no error al usuario).
- `nivel` es redundante con recorrer `parent`, pero es un `Int` que evita N queries para aplicar el tope de profundidad (§6, riesgo 2). Se escribe una vez al crear.

### 1.3 Qué NO se agrega

No se crea una tabla `Subproceso` ni un modelo de árbol genérico. El árbol es el propio `Diagram` con una auto-relación: es la representación mínima que soporta lo pedido y ya deja lista la estructura para F07 (Valor → Proceso → Subproceso), donde `nivel` pasa a tener significado metodológico.

### 1.4 Campos E1/E1b (entradas/salidas)

Misma migración, para no tocar `Paso` dos veces (criterio ya declarado en `BRECHA...` §3 para el incremento 4):

```ts
entradas?: string[];   // qué necesita la actividad para poder ejecutarse
salidas?: string[];    // qué produce
```

Opcionales y vacíos por defecto → **la migración no rompe ningún diagrama existente** (`parsePasos` con Zod sigue validando los JSON actuales). Reglas nuevas del motor:

- **E1** (`pendiente`): actividad con `salidas` declaradas que ningún paso posterior consume, o `entradas` que nadie produjo antes → cadena entrada/salida rota.
- **E1b** (`sugerencia`): actividad sin `entradas` ni `salidas` declaradas → no se puede evaluar E1. No bloquea: hoy el LLM no las extrae y marcar todo el diagrama como pendiente sería ruido, no información.

**Nota de alcance:** que el LLM *extraiga* entradas/salidas del prompt es un cambio en `extraccion-llm.ts` (schema + prompt) que sumo al sizing, pero E1 es evaluable igual si el usuario las carga a mano en el panel.

---

## 2. Cómo se cuenta el tope de 50 nodos

**Decisión: por diagrama individual. Cada nivel cuenta su propio tope. NO acumulado en el árbol.**

```
nodosDelDiagrama = pasos.length      // todos los Paso son nodos
```

Todos los `tipo` cuentan 1: eventos (`inicio`, `fin_ok`, `fin_error`), actividades (`tarea`, `sistema`), decisiones (`decision`) y el propio nodo `subproceso`. Los `siguiente`/`siguienteSi`/`siguienteNo` son arcos y **no cuentan** — verificado contra el paper, es exactamente el punto que cerró el analista.

**Justificación con el criterio de G7 ya verificado:** el umbral de 50 mide la carga cognitiva de leer **un** modelo. El hallazgo empírico (>50% de tasa de error) se midió sobre modelos individuales, no sobre repositorios. Contar el árbol completo invertiría el sentido de la guía: G7 *prescribe* descomponer, así que un criterio acumulado haría que descomponer no ayudara nunca a cumplir el tope — un proceso de 120 nodos seguiría "en infracción" después de partirlo bien. Sería usar la guía contra sí misma.

**Consecuencia contable a tener presente:** cortar un tramo de N pasos hacia un subproceso deja en el padre `N − 1` nodos menos (los N se van, entra 1 nodo `subproceso`) y crea un hijo con `N + 2` nodos (el tramo más su `inicio` y su `fin_ok` propios, ver §3.3). El árbol total crece en 3 nodos. Es esperado y correcto: se paga complejidad global a cambio de legibilidad local, que es precisamente el trade-off de G7.

**Tres umbrales, no uno:**

| Umbral | Fuente | Comportamiento |
|---|---|---|
| **15–20 actividades** | spec §3.4 (meta, hoja A3) | Nada en la UI. Es meta de diseño, no alarma. |
| **> 40 nodos** (aviso preventivo) | criterio propio, ver abajo | Aviso no bloqueante: "vas por X nodos de 50". Acá es donde tiene sentido usar el dato de Mendling. |
| **> 50 nodos** | G7, tope duro | Regla **M4**, severidad `pendiente` → bloquea exportación (mismo criterio que ya usa `tienePendientesSinResolver`). Se ofrece descomponer, y se puede seguir con un diagrama único **asumiendo la advertencia** (spec §3.4 lo permite explícitamente: "o pide seguir con un solo diagrama"). Que sea `pendiente` y no `bloqueante` es lo que hace posible ese escape. |

Sobre mostrar el dato empírico en la UI (el parent lo dejó a criterio de producto): **sí lo mostraría, pero solo en el aviso de >40 y en el mensaje de M4**, en una línea y con la fuente: *"Sobre 50 elementos, más de la mitad de los modelos contiene errores (Mendling et al., 2.000 modelos de industria)."* Es el argumento que convierte el tope de capricho de la herramienta en criterio profesional defendible ante el cliente del usuario. No lo pondría en ningún otro lado — repetido pierde efecto. **Decisión final de copy: PRODUCT MANAGER.**

---

## 3. Flujo de descomposición: ¿el sistema propone o el usuario elige?

### 3.1 La restricción técnica que manda sobre todo lo demás

Un tramo solo puede convertirse en subproceso si es una **región de una entrada y una salida** (SESE): exactamente un arco entra al tramo desde fuera, y exactamente un arco sale del tramo hacia fuera. Si no, no hay forma de reemplazarlo por un único nodo en el padre sin perder o inventar flujo — y `bpmn:CallActivity` tiene una sola entrada y una sola salida.

Esto es una **validación obligatoria**, elija quien elija el corte. Es también lo que evita que este incremento produzca diagramas corruptos.

### 3.2 Opciones y sizing

| Opción | Qué hace | Sizing | Riesgo |
|---|---|---|---|
| **A · Manual pura** | El usuario selecciona pasos, el sistema valida SESE y corta | **S-M** | **No cumple CA-3**, que dice "el sistema **propone** una descomposición". Sería incumplir la spec, no simplificarla. |
| **B · Propuesta determinística por actor contiguo** | El sistema recorre el flujo y propone como corte el tramo contiguo más largo asignado a un mismo actor que además sea SESE. El usuario acepta, ajusta la selección, o descarta. | **M** | Bajo. Es recorrido de grafo, sin IA, testeable con casos fijos (mantiene CA-14, determinismo). Puede proponer un corte mediocre; el usuario lo ajusta. |
| **C · Propuesta por análisis semántico (LLM)** | El LLM agrupa por afinidad de significado | **L** | Alto y contraindicado. Rompe determinismo, y la spec (Artículo 3) manda que estas reglas las evalúe el código, no la IA. **Descartada.** |

**Recomendación: B.** Cuesta poco más que A, cumple CA-3 literalmente, y el criterio "tramo contiguo del mismo actor" no es arbitrario: coincide con lo que un analista corta a mano (un tramo que vive entero en un área) y con la intención de carriles de la spec §2. Si ningún tramo por actor da SESE, el sistema cae a "proponer el tramo SESE más largo disponible"; si tampoco hay ninguno, dice honestamente *"no encontré un corte limpio, elegí vos los pasos"* y habilita el modo manual (que existe igual, como ajuste de la propuesta).

### 3.3 Operación de corte — qué hace exactamente

Server action `descomponerEnSubprocesoAction(diagramId, pasoIds[])`, todo en una `$transaction`:

1. Validar SESE sobre `pasoIds`. Si falla → error legible, no se toca nada.
2. Crear `Diagram` hijo: `parentDiagramId`, `parentPasoId`, `nivel = padre.nivel + 1`, `cliente`/`proceso` heredados, `actores` = los actores presentes en el tramo.
3. `pasos` del hijo = tramo movido + un `inicio` sintético (→ primer paso del tramo) + un `fin_ok` sintético (← último paso del tramo). El arco que salía del tramo se reemplaza por el `fin_ok`.
4. En el padre: quitar los pasos del tramo, insertar un `Paso` `{ tipo: "subproceso", subprocesoDiagramId: hijo.id, texto: <nombre que el usuario da al subproceso>, actor: <actor dominante del tramo> }`, y **repuntar** el arco entrante y el saliente a ese nodo nuevo.
5. Re-evaluar completitud de padre e hijo (el motor del Incremento 1 corre tal cual, sin cambios).

La operación inversa (`plegarSubproceso`, reinsertar el hijo en el padre y borrarlo) **la dejo fuera del Incremento 2**. Es simétrica y no es difícil, pero no está pedida por la spec y el usuario tiene un camino de salida (borrar y rehacer). Si PM la quiere, es **S** adicional.

### 3.4 UI (esto lo especifica DISEÑADOR-UX, yo solo declaro lo que el stack soporta)

- **Ícono "+"** en el nodo del lienzo: en el render propio de Mapea (`mermaid-render.ts`) el "+" lo dibujamos nosotros — no depende de que ninguna librería lo soporte. Riesgo cero.
- **Clic → navega a `/diagramas/{hijoId}`**, ruta que ya existe. No hay pantalla nueva que inventar: el hijo es un diagrama normal.
- **Breadcrumb** "Proceso de Venta › Cotización" desde `parentDiagramId`/`nivel`.

---

## 4. Impacto en la exportación `.bpmn`

### 4.1 Qué elemento BPMN corresponde

**`bpmn:CallActivity` con `calledElement` apuntando al `id` del `bpmn:Process` del hijo.** No `bpmn:SubProcess`: `SubProcess` es el subproceso *embebido* en el mismo proceso — es justamente la representación inline que Patricio descartó. `CallActivity` es la referencia a un proceso reutilizable definido aparte, que es exactamente la decisión tomada. La semántica del archivo coincide con la semántica del producto, sin forzar nada.

En `exportar-bpmn.ts`, `TIPO_A_ELEMENTO` gana `subproceso: "bpmn:CallActivity"`, y el id de proceso pasa a derivarse del diagrama (`Process_{diagramId}`) en vez del literal `"Process_1"` actual, para que las referencias entre archivos resuelvan.

### 4.2 Qué se exporta — recomendación

**Un archivo por diagrama, más un "exportar árbol completo" que entrega un `.zip` con un `.bpmn` por nivel, con ids de proceso consistentes.**

- Exportar el nivel actual sigue funcionando igual que hoy (cero regresión). El `CallActivity` queda con un `calledElement` que apunta a un proceso definido en otro archivo — es una referencia colgante si se abre ese archivo solo, pero es **BPMN válido**: `calledElement` es un `QName` y el estándar no exige que el proceso llamado esté en el mismo documento.
- El `.zip` da al usuario el árbol completo para importar en Camunda/bpmn.io, donde las referencias resuelven al tener ambos procesos cargados.

**Por qué NO un archivo único con múltiples `<bpmn:Process>` (que sería lo más elegante):** `bpmn-auto-layout.layoutProcess()` recibe un XML y devuelve el XML con DI calculado; **no está verificado que genere DI para más de un `Process` por `Definitions`**. Este es exactamente el tipo de supuesto que ya nos falló una vez con lanes (`BRECHA...` §4.3) — no lo vuelvo a asumir. **Tarea para DEV: spike de 1 día**, pasarle a `layoutProcess` un `Definitions` con dos `Process` y verificar cuántos `bpmndi:BPMNDiagram` devuelve. Si los genera bien, el archivo único pasa a ser la salida preferida y el `.zip` queda como alternativa. Si no, el `.zip` es la salida y no perdimos nada.

### 4.3 Interacción con la limitación de lanes

**Opción A sigue vigente y sin cambios** (`BRECHA...` §4.3): el `.bpmn` es semánticamente correcto pero sin recuadros de carril dibujados. La descomposición **no empeora esto** — al contrario, lo alivia: diagramas de ≤50 nodos con menos actores por diagrama se ven razonablemente aunque el carril no esté dibujado. La reapertura de esa decisión sigue programada para el Incremento 4 (SVG/PDF/HTML), donde el carril visible sí importa. **Sin cambio de decisión acá.**

---

## 5. Sizing del Incremento 2

**T-shirt: M-L** — un escalón por encima del Incremento 1 (M). La diferencia es que acá hay migración de BD, cambio de modelo de datos con dos consumidores nuevos (export + render), navegación entre entidades, y una operación transaccional que puede corromper datos si sale mal. El Incremento 1 era lógica pura sin persistencia nueva.

| Pieza | Sizing | Nota |
|---|---|---|
| Migración Prisma + tipo `subproceso` + campos `entradas`/`salidas` en `Paso` y Zod | **S** | Todo opcional, sin backfill. |
| Conteo de nodos + regla M4 + aviso >40 | **S** | Es `pasos.length`. Se enchufa al motor existente sin tocarlo. |
| Reglas E1/E1b en el motor | **S** | Lógica pura, mismo patrón que las 8 reglas ya escritas. |
| Extracción de entradas/salidas por el LLM (`extraccion-llm.ts`) | **S-M** | Cambio de `json_schema` + prompt. Riesgo: puede degradar calidad del resto de la extracción — DEV debe comparar contra casos actuales antes de mergear. |
| Propuesta de corte (Opción B: SESE + actor contiguo) + validación SESE | **M** | Es la pieza algorítmica del incremento. Testeable con casos fijos. |
| `descomponerEnSubprocesoAction` transaccional | **M** | La pieza de mayor riesgo de datos. Exige tests de que el padre queda con flujo íntegro. |
| Navegación padre↔hijo + ícono "+" + breadcrumb | **S-M** | Rutas ya existen; es render y links. |
| Export: `CallActivity` + ids por diagrama + `.zip` de árbol | **S-M** | Más el spike de multi-`Process` (**S**, independiente). |
| Borrado en cascada + reglas de integridad del árbol | **S** | Ver §6. |

**Timeline: lo confirma DEV, no lo comprometo yo.** Orden de magnitud, mismo criterio que usé para el Incremento 1: esto es claramente más que ese incremento; rango de un par de semanas, no de días. La cifra la valida DEV.

**Si hay que recortar alcance,** el orden en que yo sacaría cosas: (1) el `.zip` de árbol completo — el export por nivel ya sirve; (2) E1/E1b — se pueden mover al Incremento 3 sin romper nada, dado que los campos ya quedarían migrados; (3) la propuesta automática de corte (bajar de B a A) — pero esto **incumple CA-3** y requiere que PM lo acepte explícitamente, no lo decido yo.

---

## 6. Riesgos técnicos y decisiones que escalo

**1. `trialDiagramsCreated` — impacto comercial no técnico, lo escalo a PM/Patricio.** Descomponer crea un registro `Diagram` nuevo. Hoy `User.trialDiagramsCreated` limita el trial a **1 diagrama en total, para siempre** (`src/lib/trial.ts`). Tal como está, **el primer usuario de trial que descomponga se queda sin cupo**, aunque no haya gastado ni una llamada extra al LLM (el corte es determinístico, no llama a Claude). **Mi recomendación técnica: los diagramas hijos NO incrementan el contador** — el contador existe para acotar el costo de la API de Claude, y descomponer no lo genera. Implementación: incrementar solo cuando `parentDiagramId === null`. **Confirmación de PRODUCT MANAGER requerida antes de codear.**

**2. Profundidad y ciclos.** Nada impide en la BD que A sea padre de B y B de A, o un árbol de 12 niveles. Dos guardas baratas: rechazar la descomposición si `nivel >= 3` (la metodología de `METODOLOGIA-JERARQUIA-MAPEA.md` define 4 niveles y el 4.º es texto, no diagrama), y verificar en la creación que el hijo es nuevo (nunca se enlaza un `Diagram` preexistente, así el ciclo es estructuralmente imposible).

**3. Borrado.** Borrar el padre borra los hijos (`onDelete: Cascade` en la auto-relación) — correcto, un subproceso sin padre no tiene sentido. Pero borrar solo el **paso** `subproceso` desde el editor dejaría un `Diagram` huérfano: `eliminarPasoAction` debe detectar `tipo === "subproceso"` y pedir confirmación explícita ("esto elimina también el subproceso X y sus N pasos"). Es el caso que más fácil se olvida.

**4. Reordenar severidades por prioridad de 7PMG — registrado, no decidido ahora.** El paper trae un ranking votado por 21 modeladores profesionales: **G4 (estructuración) y G7 (descomposición) son las de MAYOR impacto percibido**; G3 (un inicio/un fin) y G5 (evitar OR) son las de MENOR — y G3 es justamente la que hoy tratamos como `bloqueante` (regla M1), mientras G7 la vamos a tratar como `pendiente` (M4). Hay una inversión entre nuestra severidad y el impacto percibido por profesionales. **No propongo cambiar nada ahora**: M1 es bloqueante por una razón distinta (sin inicio, el motor no puede evaluar alcanzabilidad — es una dependencia técnica, no un juicio de calidad). Queda registrado para cuando `metodologo-bpm` revise el mapa completo de severidades.

**5. Riesgo de dato.** `descomponerEnSubprocesoAction` es la primera operación de Mapea que modifica dos registros a la vez y **no hay versionado** (el Incremento 3 lo trae). Un corte mal hecho es irreversible hoy. Mitigación mínima para este incremento: guardar el `pasos` del padre previo al corte en una columna `pasosBackup Json?` del hijo, para poder deshacer una vez. Es **S** y compra tranquilidad hasta que exista el versionado real.

---

## Resumen ejecutivo

**Modelo:** tipo nuevo `Paso.tipo = "subproceso"` + campo `subprocesoDiagramId` (fuente de verdad) apuntando a otro `Diagram`, más `parentDiagramId`/`parentPasoId`/`nivel` en `Diagram` como índice denormalizado para navegación y cascada. Los campos `entradas`/`salidas` de E1/E1b entran en la misma migración para no tocar `Paso` dos veces.

**Conteo:** 50 nodos **por diagrama individual**, no acumulado — contar el árbol invertiría el sentido de G7. Arcos no cuentan (verificado). Aviso preventivo a >40 nodos y M4 como `pendiente` a >50 (`pendiente`, no `bloqueante`, para permitir el escape "sigo con un diagrama único" que la spec §3.4 concede).

**Flujo:** el sistema **propone** el corte con una heurística determinística (tramo contiguo del mismo actor que sea región de una entrada y una salida) y el usuario ajusta o descarta. Manual pura sería más barato pero incumple CA-3.

**Export:** `bpmn:CallActivity` con `calledElement`; un archivo por diagrama + `.zip` del árbol. Archivo único multi-`Process` queda condicionado a un spike de 1 día sobre `bpmn-auto-layout` — no lo asumo, es el mismo tipo de supuesto que ya falló con lanes. La Opción A sobre carriles sigue vigente sin cambios.

**Sizing: M-L.** Timeline lo confirma DEV.

**Escalo a PRODUCT MANAGER, bloqueante antes de codear:** descomponer crea un `Diagram` y hoy eso consumiría el cupo único del free trial sin haber gastado una sola llamada al LLM. Mi recomendación es que los hijos no cuenten, pero la decisión es de producto.
