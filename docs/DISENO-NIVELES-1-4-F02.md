# Niveles 1 (Diagrama de Valor) y 4 (Procedimientos) — diseño técnico

**Autor:** ARQUITECTO IT
**Fecha:** 2026-08-05
**Estado:** propuesta de diseño. NO implementada. DEV construye después de validación de PM.

**Insumo cerrado que este diseño da por resuelto (no se reabre):** `docs/METODOLOGIA-JERARQUIA-MAPEA.md`, validada por Patricio el 2026-08-05. Define qué es cada nivel, el flujo end-to-end (§6) y la regla de cero invenciones aplicada por nivel (§4): el LLM **puede** proponer el borrador de Nivel 1 porque la estructura de macroprocesos es estándar por rubro; **no puede** inventar contenido de Niveles 2-4. Este doc diseña el CÓMO técnico, no discute el QUÉ.

**Docs previos que este diseño respeta y extiende (no los contradice):**
- `docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md` — árbol de `Diagram`, `Paso.tipo = "subproceso"`, tope de niveles.
- `docs/DISENO-INCREMENTO-3-F02.md` — `huecosReconocidos`, reglas A4/M5/M6.
- `docs/DISENO-VERSIONADO-F02.md` — `DiagramVersion`, borrado lógico, `mutarDiagramaVersionado`.

**Un solo doc para los dos niveles, a propósito.** No porque haya que construirlos juntos —recomiendo lo contrario, ver §7— sino porque comparten una única pregunta de fondo: *qué cabe dentro del modelo `Diagram` y qué no*. Contestarla dos veces por separado es cómo se terminan tomando dos decisiones incompatibles.

---

## 0. Verificación previa contra el código real

Antes de proponer nada, verifiqué el estado actual en `generador-bpmn/` (no me fié de los docs de diseño, que describen intención, no lo construido):

| Afirmación | Verificado en | Estado |
|---|---|---|
| `Diagram` tiene `parentDiagramId`/`parentPasoId`/`nivel` | `prisma/schema.prisma:133-135` | ✅ en producción |
| `Paso.tipo` incluye `"subproceso"` + `subprocesoDiagramId` con `superRefine` | `src/lib/diagramas.ts:20,46,71` | ✅ |
| `Paso` ya tiene `entradas`/`salidas` opcionales | `src/lib/diagramas.ts:51-52` | ✅ migrados, sin reglas E1 todavía |
| Descomponer NO consume cupo de trial | `src/app/(app)/actions.ts:577-583,651-653` | ✅ decisión ya tomada e implementada |
| Cupo de trial = 1 diagrama total, para siempre (contador que solo sube) | `src/lib/trial.ts:16,73-78` | ✅ — **cambia por decisión del 2026-08-07, ver §2.3** |
| `eliminarDiagramaAction` hace borrado **físico**, no lógico | `actions.ts:283` (`prisma.diagram.delete`) | ⚠️ el `deletedAt` solo lo escribe el camino de `quitarPaso`/`descomponer` |
| `revivirSubarbol` solo revive hijos (se llama con `subprocesoDiagramId`) | `versionado.ts:179`, `actions.ts:735` | ✅ — ningún camino resucita un diagrama **raíz** |
| `evaluarCompletitud(pasos)` es función pura, sin acceso a BD | `src/lib/completitud.ts:140` | ✅ (dato clave para §5.3) |
| Borrado lógico vía `deletedAt` + poda diferida | `schema.prisma:151`, `versionado.ts:163` | ✅ |
| El dashboard lista por `{ userId, deletedAt: null }` | `dashboard/page.tsx:14` | ✅ — **no filtra `parentDiagramId: null`**, ver §2.4 |

Ese último punto es una deuda existente que el Nivel 1 agrava y hay que cerrar en la misma tanda.

---

# PARTE A — Nivel 1: Diagrama de Valor

## 1. Modelo de datos

### 1.1 Decisión: tabla nueva `ValueMap`, con macroprocesos como `Json`

Dos decisiones separadas, las justifico por separado.

**(a) Tabla nueva, NO `Diagram` con un `tipo` distinto.**

La tentación de reutilizar `Diagram` es real —ya tiene auto-relación, versionado, autorización— y normalmente reutilizar gana. Acá no, por tres razones que van de menor a mayor gravedad:

1. **Ningún consumidor de `Diagram` sirve.** El contrato de `Diagram` es `actores[] + pasos[]` con semántica de flujo. Sobre ese contrato corren hoy `evaluarCompletitud` (13 reglas que hablan de inicio, alcanzabilidad, decisiones), `mermaid-render` (carriles), `exportar-bpmn` (elementos BPMN) y `descomposicion` (regiones SESE). Un Diagrama de Valor no tiene inicio, ni fin, ni arcos, ni actores. Reutilizar `Diagram` significa poner un `if (tipo === "valor") return` al principio de **todos** ellos. Cuando el criterio de "es un tipo nuevo y no un campo" del Incremento 2 se aplicó al `Paso` `subproceso`, el argumento fue que se comportaba distinto en 3 lugares. Acá se comporta distinto en 100% de los lugares: eso no es reutilizar, es heredar de una clase que no comparte nada.
2. **La cardinalidad es incompatible.** `Diagram.parentDiagramId` modela "un `Paso` abre exactamente un hijo". El Diagrama de Valor es padre de **muchos diagramas raíz**, uno por macroproceso que el usuario decida detallar, y cada uno es un árbol completo por su cuenta. Forzarlo dentro de la misma auto-relación rompe la semántica de `nivel` (que hoy alimenta `TOPE_NIVELES`) y obligaría a renumerar todo diagrama existente.
3. **`onDelete: Cascade` sería catastrófico.** La auto-relación de `Diagram` borra en cascada hacia abajo: es correcto para subprocesos (un subproceso sin padre no significa nada). Si el Diagrama de Valor fuera un `Diagram` padre, **borrarlo borraría todos los procesos que el usuario modeló en su vida**. Un mapa de macroprocesos es una vista de navegación descartable; los procesos que cuelgan de él son el trabajo del usuario. Tienen ciclos de vida opuestos, así que no pueden compartir una relación con cascada.

**(b) Macroprocesos como `Json` en la misma fila, NO como tabla de filas.**

Son entre 6 y 15 elementos, se editan siempre como bloque (el usuario acepta/ajusta el borrador completo, no una caja aislada), no se consultan individualmente y no tienen relaciones propias. Es exactamente el caso de `Diagram.actores`/`Diagram.pasos`, que ya es `Json` por la misma razón. Una tabla `Macroproceso` agregaría una migración, un `include`, y ordenamiento explícito, a cambio de nada.

### 1.2 Esquema propuesto

```prisma
model ValueMap {
  id        String   @id @default(cuid())
  userId    String
  cliente   String   // la empresa mapeada (mismo campo libre que Diagram.cliente)
  rubro     String   // input del usuario; es el ÚNICO insumo del borrador LLM

  /// Alcance declarado del mapa. Se pide en la pantalla de Nivel 1, antes de
  /// generar. NO es metadato decorativo: gobierna qué avisos de
  /// revisarMapaValor aplican (§3.3). "empresa" | "unidad" | "sede".
  /// Default "empresa" porque es el caso mayoritario en PYME.
  alcance   String   @default("empresa")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  /// Macroprocesos vigentes (los que el usuario editó y confirmó).
  /// Fuente de verdad. Ver macroprocesoSchema en src/lib/valor.ts.
  macroprocesos Json @default("[]")

  /// El borrador que devolvió el LLM, intacto, tal como llegó. Nunca se
  /// sobrescribe con las ediciones del usuario. Existe para dos cosas:
  /// (a) "volver al borrador" sin gastar otra llamada al LLM; (b) poder
  /// mostrar honestamente qué propuso la máquina vs. qué puso el usuario.
  borradorLlm Json @default("[]")

  /// null = todavía es borrador (badge "propuesta editable" en toda la UI).
  /// No se puede bajar de nivel a un macroproceso hasta que esto tenga fecha.
  confirmadoAt DateTime?

  deletedAt DateTime?

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  diagrams Diagram[]

  @@index([userId, deletedAt])
  @@schema("generador_bpmn")
}
```

```prisma
model Diagram {
  // ... sin cambios ...

  /// Nivel 1: de qué Diagrama de Valor bajó este diagrama, y a qué
  /// macroproceso corresponde. Índice denormalizado — la fuente de verdad
  /// del enlace es Macroproceso.diagramId dentro de ValueMap.macroprocesos,
  /// mismo criterio que Paso.subprocesoDiagramId vs parentDiagramId (§1.2
  /// del Incremento 2). SetNull, NO Cascade: borrar el mapa de valor no
  /// puede borrar los procesos modelados.
  valueMapId     String?
  macroprocesoId String?

  valueMap ValueMap? @relation(fields: [valueMapId], references: [id], onDelete: SetNull)

  @@index([valueMapId])
}
```

```ts
// src/lib/valor.ts
export const CATEGORIAS = ["estrategico", "core", "soporte"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

/** Etiquetas visibles al usuario. El enum de arriba NO cambia: "core" es el
 *  valor técnico y es lo que viaja en el Json, en Zod y en el prompt. Lo que
 *  el usuario lee en pantalla es esto y solo esto — en ninguna pantalla,
 *  aviso ni export aparece la palabra "core". (Decisión de Patricio,
 *  2026-08-07: la etiqueta es "Del negocio", no "Core".) */
export const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  estrategico: "Estratégicos",
  core:        "Del negocio",
  soporte:     "De apoyo",
};

/** Alcance del mapa. Etiquetas de UI: "Empresa completa" / "Una unidad o
 *  área" / "Una sede". Solo "empresa" habilita los avisos V1/V3/V4 (§3.3). */
export const ALCANCES = ["empresa", "unidad", "sede"] as const;

export const macroprocesoSchema = z.object({
  id: z.string().min(1),              // "m1", "m2"... estable, no se reusa
  nombre: z.string().min(1).max(60),
  categoria: z.enum(CATEGORIAS),
  descripcion: z.string().max(200).default(""),
  /** Diagram de Nivel 2 que detalla este macroproceso. undefined = caja sin
   *  detallar todavía (§6.3 de la metodología: no se generan todos de golpe). */
  diagramId: z.string().optional(),
  /** true si vino del borrador LLM y el usuario no lo tocó. Es lo que
   *  sostiene la condición 1 de §4 de la metodología: el sistema declara
   *  qué es suposición de plantilla y qué validó el usuario. */
  propuestoPorIa: z.boolean().default(false),
});
```

### 1.3 Por qué duplicar el enlace (igual que en descomposición)

`Macroproceso.diagramId` (dentro del Json) es la fuente de verdad; `Diagram.valueMapId`/`macroprocesoId` son índice denormalizado, y existen por lo mismo que `parentDiagramId`: (a) breadcrumb "Mapa de Valor › Ventas › Cotización" sin escanear todos los `ValueMap` del usuario buscando quién apunta a este diagrama; (b) `SetNull` automático al borrar el mapa; (c) listar los diagramas de un mapa con un `where`, no con un `map` sobre Json. **Se escriben ambos lados en la misma `$transaction`; si divergen, gana el Json.** Misma regla operativa ya vigente.

### 1.4 Qué NO se agrega

- **No hay `ValueMapVersion`.** El versionado (`DiagramVersion`) existe porque una operación sobre `Diagram` puede corromper un flujo de 50 nodos de forma irreversible. Un mapa de valor son 10 cajas de texto: el costo de rehacerlo a mano es de un minuto, y `borradorLlm` ya da el "volver al inicio". Duplicar la maquinaria de versionado para esto es la definición de sobre-diseño. Si aparece demanda real, se agrega después sin migración destructiva.
- **No se toca `Diagram.nivel`.** Sigue significando "profundidad dentro del árbol de subprocesos", con la raíz en 0. El nivel metodológico es `Diagram.nivel + 2`. Renumerar para que el Nivel 1 sea 1 obligaría a un backfill de toda la tabla y a revisar `TOPE_NIVELES` en `descomposicion.ts`, a cambio de estética. **DEV: dejar esto comentado en el schema**, porque es exactamente el tipo de desalineación que la próxima persona "corrige" y rompe.
- **No hay reglas de riesgo/fricciones en Nivel 1.** §3 de la metodología es explícita: sin flujo ni actores no hay material, y generarlas sería inventar.

## 2. Interacción con trial y suscripción

### 2.1 El argumento del Incremento 2 NO se transfiere acá

Que descomponer no consuma cupo se justificó así: *"el contador existe para acotar el costo de la API de Claude, y descomponer no lo genera"* (corte determinístico). **El Diagrama de Valor sí llama al LLM.** Copiar la conclusión sin copiar la premisa sería un error.

Pero la llamada no es comparable a la de un BPMN: entrada de una línea (el rubro), salida de ~10 objetos de dos campos, sin `pasos` ni razonamiento de flujo. Con la configuración actual (`extraccion-llm.ts:162-170`, `effort: "high"`, `max_tokens: 8000`) una extracción de proceso es un orden de magnitud más cara que esto. Para el borrador de valor corresponde `effort: "low"` y `max_tokens: 1500`.

### 2.2 Recomendación

**Crear un Diagrama de Valor NO consume `trialDiagramsCreated`. Se acota con su propio contador, chico.**

| Acción | Gating |
|---|---|
| Crear/generar borrador de mapa de valor | `requireAppAccess` (trial vigente o suscripción) + tope propio `trialValueMapsCreated < 3` |
| Editar / confirmar el mapa | `requireAppAccess`, sin tope (es edición local, cero LLM) |
| Bajar de nivel → crear el `Diagram` de Nivel 2 | `requireCreationAccess`, resuelto por **slot activo** — ver §2.3.1, reemplaza al contador `trialDiagramsCreated` |

Es decir: **el mapa es gratis y exploratorio, bajar a un proceso es lo que ocupa el cupo** (ocupa, no gasta: se libera al borrar, §2.3). Coherente con la métrica: el cupo mide el trabajo real de modelado, y el mapa de valor es el anzuelo. Un tope de 3 generaciones acota el abuso de "regenerá el borrador 400 veces" sin que ningún usuario legítimo lo note (el borrador se genera una vez y se edita a mano).

`trialValueMapsCreated Int @default(0)` en `User`, y `evaluarAcceso` devuelve un `puedeGenerarMapaValor` adicional. No reutilizar `puedeCrearDiagrama`: son dos recursos con dos costos distintos, mezclarlos es lo que hace que un cambio de precio después obligue a tocar lógica.

### 2.3 Política de trial — RESUELTA (2026-08-07). Ya no es bloqueante.

Este apartado escalaba una tensión comercial: con el Nivel 1, el usuario en trial ve su empresa con 9 macroprocesos y puede abrir exactamente uno, y el cupo dejaba de ser abstracto. ANALISTA-PROCESOS-NEGOCIO lo evaluó desde el perfil real del cliente objetivo (analista freelance) y **Patricio aprobó la política que sigue. Está cerrada: DEV la implementa, no la reabre.**

**(1) El cupo es un slot rehacible, no un disparo único.**

Durante el trial el usuario puede tener **un (1) proceso raíz detallado a la vez**, y puede rehacerlo o reemplazarlo las veces que quiera: borrar el que tiene y detallar otro macroproceso, o regenerar el mismo con un prompt mejor. Lo único que no puede es tener **dos procesos raíz detallados en simultáneo**.

El motivo comercial, para que quede el criterio: lo que se cobra es la **capacidad simultánea** (el proceso raíz #2, y a futuro la vista consolidada de riesgos de toda la empresa), no el intento. Un analista que no puede corregir su primer intento no evalúa el producto: lo abandona.

**(2) Nivel 1 completo, siempre gratis.** Sin cambios respecto de §2.2: el mapa de valor no consume cupo de diagramas y su único tope es el ya diseñado de 3 generaciones de borrador LLM (`trialValueMapsCreated`).

**(3) El `.bpmn` exportado en trial es el real, sin marcas ni recortes.** Byte por byte idéntico al de un usuario pago: mismo XML, sin marca de agua, sin elementos omitidos, sin comentario agregado. **DEV: no hay ninguna rama por estado de suscripción en `exportar-bpmn.ts`.** Razón: el analista necesita abrirlo en Bizagi/Camunda/bpmn.io y comprobar que el estándar es válido *antes* de confiar en pagar; un export degradado no prueba nada y es exactamente lo que rompe la confianza que el producto vende.

**(4) Anotado para cuando existan — marca en entregables cara al cliente.** Los documentos que un usuario le entrega a *su* cliente y que salen de niveles futuros (procedimientos de Nivel 4, reporte de riesgos de Nivel 3) **sí pueden llevar la marca "Generado con Mapea · versión de evaluación" mientras el usuario esté en trial**. No es parte de esta tanda —esos entregables no están construidos—, queda registrado acá para que el criterio no se pierda: la distinción es entre un **artefacto técnico de verificación** (el `.bpmn`, sin marca, punto 3) y un **entregable comercial terminado** (el PDF/`.md` que el consultor factura, con marca). No es la misma decisión y no se resuelve igual.

#### 2.3.1 Cómo se implementa: consulta derivada, sin columna nueva

**Decisión: se deriva de la BD. No se agrega columna, y `trialDiagramsCreated` deja de gobernar el gating.**

```ts
// src/lib/trial.ts
export const TRIAL_MAX_RAICES_SIMULTANEAS = 1;

const raicesActivas = await prisma.diagram.count({
  where: { userId, parentDiagramId: null, deletedAt: null },
});
// puedeCrearDiagrama = suscripcionActiva
//   || (trialActivo && raicesActivas < TRIAL_MAX_RAICES_SIMULTANEAS)
```

Por qué la consulta derivada y no una columna `trialRaicesActivas` que sube y baja:

1. **El estado ya existe y es el mismo que la UI muestra.** Un contador incremental/decremental es una copia de un dato que la tabla `Diagram` ya tiene, y toda copia se desincroniza: basta una acción de borrado que se olvide de decrementar para que el usuario quede trabado en un cupo fantasma, sin forma de destrabarse solo. Ese bug es invisible hasta que un usuario lo reporta, y es irreparable sin tocar la BD a mano.
2. **Los dos caminos de borrado ya dejan el estado correcto, sin tocarlos.** `eliminarDiagramaAction` borra físicamente (la fila desaparece del `count`); `marcarBorradoLogicoSubarbol` escribe `deletedAt` (el `where` la excluye). La consulta funciona con ambos **sin modificar ninguna de las dos**, que es justamente el argumento: no hay lugar donde alguien pueda olvidarse de mantener el contador.
3. **Ningún camino resucita una raíz.** Verificado: `revivirSubarbol` solo se invoca sobre `subprocesoDiagramId` desde `restaurarVersionAction` (`actions.ts:735`), es decir siempre sobre un **hijo**. No existe hoy un flujo que pueda hacer pasar al usuario de 1 a 2 raíces activas por la espalda. **DEV: si alguna vez se agrega "restaurar diagrama borrado" a nivel raíz, esa acción tiene que pasar por el mismo gating de cupo** — dejarlo comentado en `revivirSubarbol`.
4. **Costo nulo.** Es un `count` sobre `Diagram` filtrando por `userId`, dentro de `evaluarAcceso`, que ya hace un `findUnique` sobre `User` en el mismo request. El índice necesario ya está implícito en el filtro por `userId` que usa el dashboard.

**Qué pasa con `trialDiagramsCreated`.** Deja de participar del gating. **No se borra la columna en esta tanda** (migración destructiva, sin beneficio, y el dato histórico sirve para métricas de producto: cuántos intentos hizo un usuario antes de convertir). `registrarDiagramaDeTrial` se conserva **como telemetría** y hay que renombrar su comentario: ya no es un cupo, es un contador de generaciones acumuladas. **DEV: el comentario actual de `trial.ts:9-16` explica el razonamiento contrario al que ahora rige —"un conteo en vivo permitiría generar uno nuevo cada vez que borra el anterior"— y hay que reescribirlo entero, no dejarlo.** Ese comentario describía la política vieja como si fuera una verdad técnica; si queda, la próxima persona "arregla" el gating de vuelta al contador.

**Riesgo asumido, explícito (lo registro, no lo reabro).** El razonamiento que el comentario viejo defendía era real: borrar y regenerar dispara `generarDesdePromptAction`, que es la llamada cara al LLM, y con slot rehacible el trial no tiene techo de llamadas. La política aprobada acepta ese costo a cambio de conversión, y el trial de 3 días ya es un techo natural. **Si el costo de API se vuelve visible, la mitigación correcta NO es volver al cupo de 1** —eso deshace la decisión de producto— sino poner un techo anti-abuso alto sobre el contador que ya existe (p. ej. `trialDiagramsCreated < 10`), que ningún usuario legítimo alcanza. **No se implementa ahora**: es una línea el día que haya un dato que lo justifique, y agregarlo hoy sería optimizar contra un problema que nadie midió.

#### 2.3.2 Impacto en el gating de "bajar de nivel"

La tabla de §2.2 se lee así con la política resuelta:

| Acción | Gating |
|---|---|
| Crear/generar borrador de mapa de valor | `requireAppAccess` + `puedeGenerarMapaValor` (`trialValueMapsCreated < 3`) |
| Editar / confirmar el mapa | `requireAppAccess`, sin tope |
| **Bajar de nivel → crear el `Diagram` raíz del macroproceso** | `requireCreationAccess`, ahora resuelto por **slot activo** (`raicesActivas < 1` en trial), no por contador acumulado |
| Borrar el proceso raíz detallado | `requireAppAccess`, sin gating — **es lo que libera el slot** |
| Descomponer en subprocesos | sin cupo (decisión del Incremento 2, sin cambios: los hijos tienen `parentDiagramId != null`, no cuentan) |
| Exportar `.bpmn` | `requireAppAccess`. **Sin diferencia alguna entre trial y pago** |

**Consecuencia para la pantalla de Nivel 1 (esto es lo que estaba trabado y ahora se puede escribir).** Con 9 macroprocesos en pantalla y el slot ocupado, las demás cajas **no se muestran bloqueadas con candado**: se muestran con la acción *"Detallar este proceso"* disponible, y al invocarla —con el slot ocupado— el sistema explica que en la versión de evaluación se detalla un proceso a la vez y ofrece dos salidas: **(a)** reemplazar el actual (borra el detallado y detalla este; confirmación explícita porque destruye trabajo), o **(b)** suscribirse para tener los dos. **DEV: el server valida el cupo igual, siempre** — el diálogo es UX, no el control. El copy exacto lo cierra DISEÑADOR-UX; lo que el diseño técnico fija es que existen esas dos salidas y que ninguna caja queda muerta.

### 2.4 Deuda que hay que cerrar en la misma tanda

`dashboard/page.tsx:14` filtra por `{ userId, deletedAt: null }` pero **no por `parentDiagramId: null`** — el comentario del propio archivo admite que los hijos "raramente" aparecen. Con Nivel 1, la lista principal pasa a mezclar mapas de valor, procesos raíz y subprocesos sueltos. Hay que definir la consulta del dashboard de una vez: **mapas de valor arriba, y `Diagram` solo con `parentDiagramId: null`**. Es **S**, pero si no se hace ahora la pantalla de entrada queda incomprensible.

## 3. Qué genera el LLM vs. qué valida el código (Artículo 3)

### 3.1 El LLM propone — y solo esto

Input: `rubro` (string libre, corto) + `cliente`. Nada más — §4 de la metodología es explícita en que con eso alcanza para un patrón de industria y que pedir más ya sería levantamiento real.

Output (`json_schema` estricto, mismo patrón que `extraccion-llm.ts`): lista de `{ nombre, categoria, descripcion }`. **Nada de `diagramId`, nada de `pasos`, nada de actores.** El LLM no toca el enlace hacia Nivel 2: eso lo escribe el código cuando el usuario baja de nivel.

Reglas del system prompt, heredando el tono de las 7 ya escritas:
1. Solo macroprocesos reconocibles del rubro declarado. Si el rubro es ambiguo o no se reconoce, devolver la estructura mínima genérica (Ventas / Operaciones / Compras / Finanzas / Personas) y decirlo en `nota`, **no inventar** especificidad que el rubro no da.
2. **Cantidades por categoría, no total:** 3-5 `estrategico`, 3-6 `core`, 4-8 `soporte`. Ninguna categoría vacía. (Reemplaza la regla anterior de "6-12 total, al menos 2 core", que permitía mapas sin gobierno y sin soporte.)
3. **Nomenclatura obligatoria — fórmula `Sustantivo de Gestión + Objeto`, 3 a 6 palabras.**
   - Sustantivos permitidos: Gestión, Dirección, Planificación, Administración, Diseño, Desarrollo, Control, Aseguramiento, Comercialización.
   - **Prohibido:** palabras sueltas, nombres de área o departamento, siglas, verbos en infinitivo, gerundios. También, como antes, verbos de paso operativo ("Cotizar repuesto" es Nivel 2-4, no Nivel 1).
   - **Por qué 3-6 y no 1-3** (corrección posterior a la revisión de ANALISTA-PROCESOS-NEGOCIO): el rango 1-3 habilitaba justo el error a evitar — "Ventas", "RRHH", "TI" — que calcan el organigrama en vez de nombrar un proceso. El nombre de una palabra es la falla, no la excepción.
   - Tabla de conversiones (va **literal** en el prompt, como few-shot):

     | No usar | Usar |
     |---|---|
     | Atracción | Gestión de mercadeo y generación de demanda |
     | Comercial / Ventas | Gestión comercial y de ventas |
     | Implementación | Gestión de la prestación del servicio |
     | Soporte | Gestión del servicio postventa |
     | Facturación y Cobranza | Gestión de facturación y cobranza |
     | RRHH | Gestión del talento humano |
     | TI / Sistemas | Gestión de tecnología de la información (son uno solo, fusionar) |
     | Legal | Gestión legal y de cumplimiento normativo |
     | Administrativo / Finanzas | Gestión financiera y administrativa |
     | Compras | Gestión de compras y proveedores |
     | Mantenimiento | Gestión de mantenimiento e infraestructura |
     | Proyectos | Gestión de proyectos |
     | Datos | Gestión de datos e información |
     | Mejora Continua | Gestión de la mejora continua |
     | Calidad | Gestión de la calidad |
     | Dirección | Direccionamiento estratégico |

   **DEV: esto es regla del LLM, NO del usuario.** Zod valida únicamente no-vacío, ≤60 chars y sin duplicados normalizados. El usuario que edita a mano y escribe "Ventas" **nunca queda bloqueado**. Disciplinar al usuario con la fórmula sería convertir una guía metodológica en una traba de formulario.
4. **Orden secuencial de los `core`:** van en secuencia real de operación, de izquierda a derecha — el primero es el primer contacto con el cliente, el último cierra el ciclo (habitualmente facturación y cobranza). Es una **hipótesis** del LLM, marcada `propuestoPorIa` como todo lo demás, y el usuario la reordena. Ver la advertencia de orden estable en §3.4.
5. `descripcion`: una línea, qué abarca el macroproceso. Sin métricas, sin sistemas, sin nombres de personas — todo eso sería invención.
6. Nunca describir el mapa como "el mapa de tu empresa". Es una plantilla del rubro.

### 3.2 El código valida — y es dueño de esto

| Responsable | Qué |
|---|---|
| **Zod (rechaza)** | `categoria` en el enum; `alcance` en `ALCANCES`; nombre no vacío ≤60 chars; sin nombres duplicados (normalizados sin acentos/mayúsculas, misma normalización que `completitud.ts` ya usa para A4); **cantidad por categoría entre 1 y 10, con tope global de 25**. El 3-5/3-6/4-8 es guía de prompt; el 1-10 por categoría es el límite duro y existe **solo para frenar salida degenerada del LLM** (un mapa de 60 cajas o de 1), no para disciplinar al usuario. Zod **no** valida la fórmula de nomenclatura. |
| **Código (corrige en silencio)** | asigna `id` (`m1..mN`, generados por el servidor, **nunca los del LLM** — mismo criterio con que se sanean destinos rotos en `normalizarResultado`); fuerza `propuestoPorIa: true`; fuerza `confirmadoAt: null`; agrupa por categoría **preservando el orden interno** (§3.4) |
| **Código (regla de UI, no del LLM)** | el badge "Borrador — plantilla del rubro, editala" es render condicionado por `confirmadoAt === null`. **Que sea una condición de código y no una frase del prompt es lo que hace que la condición 1 de §4 sea garantía y no buena intención.** Un LLM puede olvidarse de aclarar que es un borrador; un `if` no. |
| **Código (regla de UI, no del LLM)** | los títulos de las tres columnas salen de `ETIQUETAS_CATEGORIA` (§1.2): **Estratégicos / Del negocio / De apoyo**. El enum técnico sigue siendo `core`; la palabra "core" no se renderiza en ninguna pantalla, aviso ni export. Es una tabla de traducción en un solo lugar, no un `if` repartido por los componentes. |
| **Código (guarda de flujo)** | `bajarANivel2Action` rechaza si `confirmadoAt === null`. La metodología manda secuencia; la secuencia se hace cumplir en el server, no escondiendo un botón. |

### 3.3 Reglas de completitud de Nivel 1: cuatro, informativas, y fuera del motor existente

**No se tocan `evaluarCompletitud` ni `Hueco`.** Ese motor tipa sobre `Paso[]` y su valor es que es puro y determinístico sobre un flujo; meterle un segundo dominio lo convierte en un cajón de sastre. Función aparte, **`revisarMapaValor(macroprocesos, alcance)`**, con cuatro avisos y ninguno bloqueante:

| Id | Condición | Aviso (lenguaje de dueño de PYME) | ¿Depende del alcance? |
|---|---|---|---|
| **V1** | ninguna categoría `core` con al menos un macroproceso | *"Falta el corazón del negocio: ¿qué hace tu empresa para el cliente?"* | **Sí** |
| **V2** | todos los macroprocesos siguen con `propuestoPorIa: true` al confirmar | *"Confirmaste el borrador sin editarlo. Revisá que refleje tu empresa y no la plantilla del rubro."* | No — aplica siempre |
| **V3** | alguna categoría vacía o con un solo elemento | Según cuál: *"No registraste procesos estratégicos. ¿Quién define los objetivos y revisa los resultados?"* / *"Casi no registraste procesos de apoyo. ¿Quién se ocupa de la plata, la gente y los sistemas?"* | **Sí** |
| **V4** | una categoría tiene más del doble de la suma de las otras dos | *"Tenés muchos procesos de apoyo y pocos del negocio. ¿Seguro que así entregás valor a tu cliente?"* (texto según la categoría dominante) | **Sí** |

V2 sigue siendo aviso y no bloqueo: hay rubros donde la plantilla acierta. Pero dejarlo pasar en silencio sería exactamente el riesgo que §4 de la metodología marca (*"el cliente lo valida sin darse cuenta de que es una suposición"*).

**Gating por alcance (decisión de Patricio, 2026-08-07).** `V1`, `V3` y `V4` **solo se emiten si `alcance === "empresa"`**. Con alcance `"unidad"` o `"sede"` se suprimen, porque exigirle balance de cadena de valor completa a un recorte declarado es un falso positivo garantizado: el gobierno de la empresa no vive dentro de una sucursal, y una unidad de soporte legítimamente no tiene procesos `core`. El usuario ya declaró que está mapeando una parte; el sistema no puede retarlo por eso.

```ts
export function revisarMapaValor(
  macroprocesos: Macroproceso[],
  alcance: Alcance,
): Aviso[]  // [] = sin observaciones. Nunca lanza, nunca bloquea.
```

Sigue siendo función pura y testeable con vitest, igual que `completitud.test.ts`. **DEV: el test mínimo es que un mapa incompleto con `alcance: "unidad"` devuelve solo V2 o nada.**

### 3.4 Orden estable al agrupar por categoría — requisito, no detalle de implementación

`ValueMap.macroprocesos` es un `Json`, y **el orden del array es dato real**, no presentación: define cuál macroproceso es el primer contacto con el cliente y cuál cierra el ciclo (§3.1 regla 4). Ese orden lo propone el LLM como hipótesis y lo corrige el usuario en la UI (interacción ya resuelta por DISEÑADOR-UX).

**Advertencia explícita para DEV:** el agrupamiento por categoría —tanto en el saneo del servidor como en el render de la grilla— **debe preservar el orden interno de cada grupo. Sort estable, nunca alfabético, nunca reordenar por ningún criterio derivado.** Un `sort` por nombre, o un `sort` no estable sobre `categoria`, destruye esa información **en silencio**: nada falla, nada avisa, y el usuario ve su secuencia operativa mezclada. En JS, `Array.prototype.sort` es estable por spec desde ES2019, así que alcanza con ordenar por `categoria` y no tocar nada más — el riesgo no es el motor, es que alguien agregue un criterio de desempate "para que se vea prolijo".

**El motor preserva el orden; nunca lo deduce ni lo fuerza.** Si el usuario dejó los `core` en un orden que no parece secuencial, eso es información del usuario, no un error a corregir.

### 3.5 Decisiones cerradas — no reabrir sin contexto

Todo lo de esta sección se resolvió el 2026-08-07, tras la revisión de ANALISTA-PROCESOS-NEGOCIO y DISEÑADOR-UX contra el documento `sistemaaiprocess/prompts/mapa-procesos-nivel0.md` (2026-07-23, nunca versionado). Queda anotado acá para que nadie lo replantee creyendo que es un pendiente.

**(a) Label de la categoría `core` en la UI: "Del negocio".** Decisión de Patricio. Se evaluaron "Productivos" (término del documento huérfano y de APQC/Porter) y dejarlo como "Core"; se descartan ambas, la primera por jerga de consultoría y la segunda por ser una palabra en inglés frente a un dueño de PYME. **El enum técnico no cambia: sigue siendo `core` en el código, el Json y el prompt** — lo que cambia es únicamente el texto que ve el usuario, resuelto en `ETIQUETAS_CATEGORIA` (§1.2). **DISEÑADOR-UX: no modificar por criterio propio.**

**(b) Descartado a propósito — modos de entrevista y perfiles de audiencia.** El documento huérfano definía un flujo de entrevista conversacional con dos profundidades (Ágil 10 preguntas / Completo 20 preguntas) y tres perfiles de audiencia (analista de procesos / consultor externo / dueño de negocio) que ajustaban el lenguaje de cada pregunta.

**No se implementa en esta tanda, y no es un olvido.** Razón: el diseño de Nivel 1 aquí definido se sostiene sobre un input de una línea (`rubro`) que produce un borrador explícitamente marcado como plantilla del rubro, editable por el usuario. Un flujo de 10-20 preguntas es un producto distinto —levantamiento asistido— con otro costo de LLM, otra pantalla, otra tasa de abandono y probablemente otro precio. Meterlo acá multiplicaría el alcance de una pieza que hoy es M.

**Queda registrado como feature candidata futura para PRODUCT MANAGER**, con la hipótesis de que corresponde a un tier de pago ("levantamiento asistido"). Lo que sí se rescató del documento huérfano y está incorporado arriba: la fórmula de nomenclatura (§3.1), las cantidades por categoría (§3.1), el orden secuencial de los `core` (§3.4) y la pregunta de alcance (§1.2, ex-pregunta 20 del cuestionario largo).

## 4. Sizing Nivel 1

**T-shirt: M — se mantiene.** Los siete ajustes incorporados el 2026-08-07 son todos **S** o menos y ninguno reabre el modelo de datos: el campo `alcance` es una columna con default (migración aditiva, sin backfill), las reglas de nomenclatura y cantidades son texto de prompt, V3/V4 y el gating por alcance son ramas de una función pura ya prevista, y el orden estable es una advertencia sobre código que todavía no se escribió (costo cero si se lee antes de escribirlo, costo alto si se descubre después). Sigue siendo menor que el Incremento 2 (M-L): la migración es aditiva y aislada, no hay operación transaccional que pueda corromper un flujo, y no toca el motor de reglas ni el export.

| Pieza | Sizing | Nota |
|---|---|---|
| Migración `ValueMap` (incl. `alcance`) + 2 columnas en `Diagram` + `trialValueMapsCreated` | **S** | Aditiva pura, sin backfill; `alcance` con default `"empresa"` |
| `src/lib/valor.ts` (schemas Zod, normalización, orden estable, `revisarMapaValor` con V1-V4 y gating por alcance) | **S** | Lógica pura, testeable con vitest como `completitud.test.ts`. V3/V4 + gating suman ramas, no complejidad estructural |
| Generación LLM del borrador (prompt + json_schema + saneo) | **S-M** | Archivo nuevo, **no tocar `extraccion-llm.ts`** — riesgo cero de regresión sobre la extracción que ya está en producción. La fórmula de nomenclatura y la tabla de conversiones son texto del prompt: no mueven el sizing |
| Pantalla del mapa (selector de alcance + grilla por categoría, editar/agregar/quitar/reordenar, confirmar) | **M** | Es la pieza más grande. UI nueva completa, no reusa el editor de pasos. El selector de alcance es un `select` de 3 opciones, **S** dentro de esta pieza |
| `bajarANivel2Action` + enlace transaccional + breadcrumb | **S-M** | Crea un `Diagram` raíz con `valueMapId`; reusa el flujo de creación existente |
| Gating de trial: `puedeGenerarMapaValor` + slot rehacible por consulta derivada | **S** | §2.3.1. Un `count` dentro de `evaluarAcceso`, un `const` nuevo, y reescribir el comentario de `trial.ts:9-16`. **Cero migración**: no agrega columna ni la borra |
| Diálogo "reemplazar o suscribirse" al detallar con el slot ocupado | **S** | §2.3.2. Confirmación destructiva + link a suscripción. Copy de DISEÑADOR-UX |
| Arreglo del dashboard (raíces + mapas) | **S** | Deuda preexistente, §2.4 |

**Sizing total Nivel 1: sigue siendo M — confirmado con la política de trial del 2026-08-07.** La resolución de §2.3 **baja** el trabajo respecto de lo que estaba planteado: el slot derivado elimina una migración que el contador habría necesitado, no toca el export (punto 3: cero ramas por suscripción en `exportar-bpmn.ts`), y el marcado de entregables (punto 4) queda fuera de alcance porque esos entregables no existen. Lo único que suma es el diálogo de reemplazo, que es **S** dentro de una pantalla que ya era **M**. Ninguna pieza cambió de talla.

**Timeline: lo confirma DEV.** Orden de magnitud: por debajo del Incremento 2.

---

# PARTE B — Nivel 4: Procedimientos

## 5. Modelo de datos

### 5.1 Decisión: entidad separada `Procedimiento(diagramId, pasoId)`, NO dentro del `Paso`

Meterlo en el Json de `Paso` es más simple de escribir y peor en cuatro dimensiones, dos de ellas específicas de este codebase:

1. **Peso en el camino caliente.** `pasos` se lee entero en cada render, cada `evaluarCompletitud`, cada export y cada `parsePasos`. Un procedimiento son varios KB de texto; 15 procedimientos inflan el Json 30-50x para que el 95% de los consumidores lo ignore.
2. **Explosión del versionado (la razón decisiva).** `mutarDiagramaVersionado` guarda un snapshot completo de `pasos` **en cada mutación** (`schema.prisma:180-184`). Si los procedimientos viven dentro de `pasos`, editar el texto de un paso clona todos los procedimientos del diagrama en una fila de `DiagramVersion`. Diez ediciones = diez copias de todo el manual operativo. Eso no es un problema de elegancia, es crecimiento de la tabla en órdenes de magnitud.
3. **Ciclo de vida propio.** Un procedimiento se genera, se edita, se regenera, se confirma, y tiene su propio `updatedAt` y su propio `promptFuente`. Nada de eso es un atributo del nodo del flujo.
4. **Concurrencia.** Escribir un procedimiento no debería competir con una edición del flujo sobre la misma fila.

```prisma
model Procedimiento {
  id        String   @id @default(cuid())
  diagramId String
  userId    String   // denormalizado, autoriza sin join (mismo criterio que DiagramVersion)
  pasoId    String   // id del Paso DENTRO de ese diagrama (único por diagrama, no global)

  /// Contenido estructurado. Ver procedimientoSchema en src/lib/procedimientos.ts.
  contenido Json

  /// Qué escribió el usuario para generarlo. Se guarda porque es el insumo
  /// que hace que el contenido NO sea invención (§6.2) — sin esto no se
  /// puede auditar de dónde salió cada instrucción, ni regenerar.
  promptFuente String @db.Text

  estado    String   @default("borrador") // "borrador" | "confirmado"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  diagram Diagram @relation(fields: [diagramId], references: [id], onDelete: Cascade)

  @@unique([diagramId, pasoId])
  @@index([diagramId, deletedAt])
  @@schema("generador_bpmn")
}
```

**`Cascade` acá sí es correcto** (al revés que en §1.2): un procedimiento sin su paso no significa nada, y el paso no sobrevive al diagrama.

### 5.2 Estructura del contenido — texto estructurado, no markdown libre

Markdown libre es la salida fácil y la que impide todo lo demás (validar, exportar a formatos, saber si está completo). Json validado por Zod:

```ts
export const procedimientoSchema = z.object({
  objetivo: z.string().min(1),                       // 1 línea: para qué sirve este paso
  precondiciones: z.array(z.string()).default([]),   // qué tiene que estar listo antes
  instrucciones: z.array(z.object({
    orden: z.number().int().positive(),
    accion: z.string().min(1),                       // imperativo: "Abrí el módulo X"
    herramienta: z.string().optional(),              // sistema/planilla/formulario
  })).min(1),
  resultadoEsperado: z.string().min(1),
  excepciones: z.array(z.object({
    situacion: z.string(),
    queHacer: z.string(),
  })).default([]),
  /// Lo que el usuario no aportó y el LLM se negó a inventar. Se muestra
  /// como pregunta abierta, igual que pendingQuestions en Nivel 2.
  faltantes: z.array(z.string()).default([]),
});
```

### 5.3 El problema de la estabilidad de `pasoId` (el que se olvida)

`pasoId` es único por diagrama pero **no es inmutable ni irrepetible**: los ids `p1..pN` los produce el LLM o el editor manual, y nada impide que se borre `p7` y después se cree otro `p7`. Un procedimiento colgado de un `pasoId` reciclado se re-adjunta al paso equivocado. Tres reglas obligatorias para DEV:

1. **`quitarPasoAction`** → soft-delete del procedimiento de ese `pasoId` (`deletedAt`), en la misma transacción que la mutación versionada. No borrado físico: si el usuario restaura la versión anterior (`restaurarVersionAction`), el procedimiento tiene que volver.
2. **`agregarPasoAction`** → generar ids con un sufijo no reciclable (o verificar contra procedimientos soft-deleted del mismo diagrama antes de asignar). Es una línea; sin ella, la regla 1 se vuelve una bomba.
3. **`descomponerEnSubprocesoAction`** → los pasos que se mueven al hijo se llevan sus procedimientos: `UPDATE Procedimiento SET diagramId = hijo.id WHERE diagramId = padre.id AND pasoId IN (...)`, dentro de la misma `$transaction` que ya existe. **Este es el punto de integración con código ya en producción y es donde más fácil se pierde trabajo del usuario en silencio.**

## 6. Disparo de la generación

### 6.1 Decisión: manual, por paso, a pedido. Nunca automática.

| Opción | Costo LLM por proceso de 20 pasos | Veredicto |
|---|---|---|
| Automática al confirmar el proceso | ~14 llamadas (todos los `tarea`/`sistema`) | **Descartada.** 14x el costo actual por usuario, la mayoría para pasos que nadie va a leer. Y con el input disponible, 14 invenciones (§6.2). |
| Manual, paso por paso, a pedido | 1 por paso que el usuario pida | **Recomendada** |
| Batch opcional "todos los de este actor" | N, con aviso previo de cuántos | Add-on posterior, **S**, solo si PM lo pide |

**Regla de código sobre qué pasos son elegibles** (no es UI, es validación de server, porque también gobierna el batch y la cobertura):

```
elegible(paso) = paso.tipo === "tarea" || paso.tipo === "sistema"
```

Fuera quedan, con motivo: `inicio`/`fin_ok`/`fin_error` no son trabajo (son marcas de flujo); `decision` no necesita instrucción operativa sino un criterio de decisión —que es información que ya vive en el texto de la pregunta y en las ramas, y darle un procedimiento sería duplicar—; `subproceso` no lleva procedimiento propio, sus procedimientos son los de los pasos de su diagrama hijo (y darle uno al nodo padre sería exactamente la duplicación que §3 de la metodología descarta para los reportes de riesgo).

### 6.2 De dónde sale el contenido — la restricción que define este nivel

**Esta es la parte de todo el doc que más fácil se implementa mal.**

Un `Paso` es `{ texto: "Cotiza repuesto", actor: "Vendedor", tipo: "tarea" }`. Seis palabras. El ejemplo de la metodología es *"Cómo cotizar un repuesto en el sistema X"*: qué pantalla, qué campos, qué margen, a quién se escala. **Nada de eso es derivable de las seis palabras.** Si se le pide al LLM que genere el procedimiento a partir del paso, va a producir un texto plausible, bien escrito y enteramente inventado — que es el peor resultado posible, porque el usuario lo va a firmar y entregar a su cliente.

§4 de la metodología ya lo dijo: *"Deja de ser viable — y pasa a zona de riesgo de invención — en los Niveles 2, 3 y 4, donde el detalle es específico de cada empresa y debe surgir del prompt/levantamiento real del usuario."*

**Consecuencia de diseño, no negociable: la generación es de dos tiempos.**

1. El usuario elige un paso y **escribe cómo se hace** (prompt corto y libre, el mismo mecanismo ya validado del Nivel 2). El sistema le muestra el contexto que ya tiene (actor, texto del paso, `entradas`/`salidas` si están cargadas, pasos vecinos) para que no escriba en el vacío.
2. El LLM **estructura** ese texto en el schema de §5.2. No agrega instrucciones que el usuario no dio; lo que falta va a `faltantes` como pregunta.

El LLM acá es un formateador, no una fuente. Es menos vistoso que "generá los 14 procedimientos con un botón" y es la única versión defendible ante el cliente del usuario. Si PM quiere el botón mágico, la respuesta es que el producto vendería documentación falsa con el logo del consultor.

**Corolario para el system prompt:** regla 1, *"si el usuario no describió cómo se hace un tramo, no lo completes: agregalo a `faltantes`"*. Y explícitamente prohibido inventar nombres de sistemas, campos, plazos, montos o cargos.

### 6.3 El motor de completitud: informativo, nunca bloqueante

**No se agregan reglas de Nivel 4 a `evaluarCompletitud`.** Dos razones, la primera técnica y la segunda metodológica:

1. **`evaluarCompletitud(pasos)` es puro y síncrono** (`completitud.ts:140`) — recibe pasos en memoria, no toca BD, y todo su test suite depende de eso. Saber qué pasos tienen procedimiento exige un query. Meterlo adentro obliga a volver la función async y con acceso a BD, y se pierde la propiedad que la hace testeable y determinística (CA-14).
2. **Bloquearía algo que la metodología declara opcional.** §2, nota de simplicidad: *"Forzar siempre los 4 niveles sería sobre-diseñar para un cliente PYME."* Si "paso sin procedimiento" fuera un `Hueco` `pendiente`, bloquearía la exportación (`tienePendientesSinResolver`) de todo diagrama que no procedimente los 14 pasos. Eso convierte una recomendación metodológica en una obligación del software, exactamente al revés de lo decidido.

**Lo que sí:** función aparte, `coberturaProcedimientos(pasos, procedimientos)`, que devuelve `{ elegibles, conProcedimiento, faltantes: pasoId[] }`, se calcula en la página del diagrama y se muestra como *"8 de 12 tareas tienen procedimiento documentado"* con marca visual en el lienzo. **Informativo puro, no `Hueco`, no bloquea export.**

Si más adelante PM quiere que aparezca en el reporte, el lugar correcto es una `sugerencia` (la severidad que ya existe y que por diseño no bloquea nada), nunca `pendiente`. Eso es un cambio de una línea el día que se decida — no hay que anticiparlo ahora.

### 6.4 Exportación

Los procedimientos **no entran en el `.bpmn`**. No hay elemento BPMN para una instrucción operativa; `bpmn:documentation` sobre la tarea es el único gancho y aplasta la estructura de §5.2 a un string. Salida propia: **`.md` por procedimiento y un `.md`/`.zip` por diagrama** (manual operativo del proceso). Cuando exista el export a PDF/HTML del Incremento 4, esta es su segunda sección natural. Poner una línea de referencia en `bpmn:documentation` es opcional y **S** — decisión de PM, no la anticipo.

## 7. Sizing Nivel 4

**T-shirt: M.** Casi todo el peso está en la integración con código ya en producción (§5.3), no en lo nuevo.

| Pieza | Sizing | Nota |
|---|---|---|
| Migración `Procedimiento` | **S** | Tabla nueva aislada |
| `src/lib/procedimientos.ts` (schema, elegibilidad, `coberturaProcedimientos`) | **S** | Lógica pura, testeable |
| Generación LLM estructuradora (prompt + json_schema) | **S-M** | Archivo nuevo, no toca `extraccion-llm.ts` |
| Pantalla: prompt por paso + edición del procedimiento estructurado | **M** | Editor de listas anidadas (instrucciones, excepciones). Es la pieza más grande |
| Integración con `quitarPaso` / `agregarPaso` / `descomponer` / restaurar versión | **M** | **La de mayor riesgo.** Toca 4 acciones ya en producción; exige tests de que no se pierden procedimientos al descomponer ni al restaurar |
| Indicador de cobertura en el lienzo | **S** | |
| Export `.md` del manual del proceso | **S-M** | |
| Gating de trial | **S** | Ver §8 |

## 8. Trial en Nivel 4 — escalación a PM

Cada procedimiento es una llamada al LLM, y hoy no hay ningún contador que las mida: `trialDiagramsCreated` cuenta *diagramas*. Un usuario en trial con su único diagrama de 20 pasos puede disparar 20 generaciones. **Recomendación técnica: `trialProcedimientosCreated` con tope de 3 en trial** (suficiente para que el usuario vea el valor del entregable, insuficiente para producir gratis el manual completo que es justamente lo que se vende). El número es decisión de PM; el mecanismo, mío.

---

## 9. Dependencias entre los dos niveles

**Son independientes. Confirmado, y la sospecha del planteo es correcta.**

- **Nivel 4 no depende de Nivel 1.** Solo necesita un `Diagram` con pasos `tarea`/`sistema` — que existe en producción hoy. Nada en el modelo de §5 referencia `ValueMap`.
- **Nivel 1 no depende de Nivel 4.** Baja hacia un `Diagram` de Nivel 2, que ya existe.
- **El único punto compartido** es el breadcrumb / vista de síntesis (§6.8 de la metodología): *Mapa de Valor › Proceso › Subproceso › Procedimientos*. Si se construyen en tandas distintas, cada una agrega su tramo. No hay que diseñarlo dos veces si se respeta que el breadcrumb se arma de `valueMapId` + `parentDiagramId`, ambos ya definidos.

**Ningún orden bloquea al otro.** Es una decisión de secuencia comercial y de riesgo, no técnica.

## 10. Orden recomendado: Nivel 1 primero

| Criterio | Nivel 1 | Nivel 4 |
|---|---|---|
| Riesgo sobre código en producción | **Bajo** — tabla nueva aislada, no toca motor, export, versionado ni descomposición | **Medio-alto** — toca 4 acciones ya desplegadas (§5.3); un error pierde trabajo del usuario en silencio |
| Preguntas de producto abiertas | **0** — el cupo de trial se cerró el 2026-08-07 (§2.3) | 2 (input por paso con DISEÑADOR-UX, §6.2; tope de generaciones, §8) |
| Costo LLM incremental | Bajo, acotado | Alto y proporcional al tamaño del proceso |
| Qué destraba | El **punto de entrada**: hoy Mapea arranca en el aire, pidiéndole al usuario que elija un proceso sin haberle mostrado nunca su empresa | El entregable operativo final |
| Sizing | M | M |

**Recomiendo Nivel 1 primero**, por tres razones en orden de peso:

1. **Es el punto de entrada, y hoy no existe.** El flujo actual arranca en "describí un proceso", que exige que el usuario ya sepa cuál. La metodología define un embudo (§6) cuya boca falta. Construir el Nivel 4 antes es agregarle profundidad a un embudo sin boca.
2. **Riesgo aislado.** Todo el Nivel 1 es tabla nueva + pantalla nueva + un archivo LLM nuevo. La única modificación a código existente es el arreglo del dashboard (§2.4), que es deuda que hay que pagar igual. El Nivel 4, en cambio, mete la mano en `quitarPaso`, `agregarPaso`, `descomponer` y `restaurarVersion` — cuatro caminos que hoy funcionan.
3. **El Nivel 4 tiene una decisión de UX sin resolver.** §6.2 obliga a un flujo de input por paso que DISEÑADOR-UX no diseñó todavía. Empezar por ahí es arrancar con un bloqueador; empezar por Nivel 1 le da tiempo a esa definición en paralelo.

**Contra-argumento honesto:** el Nivel 4 es lo que el consultor le entrega a su cliente, y es probablemente lo que más justifica pagar la suscripción. Si PM prioriza monetización sobre completar el embudo, el orden se invierte y no me opongo — pero entonces hay que resolver §6.2 con DISEÑADOR-UX **antes** de que DEV empiece, no durante.

---

## Resumen ejecutivo

**Nivel 1:** tabla nueva `ValueMap` (no `Diagram` con un `tipo`: ningún consumidor de `Diagram` sirve, la cardinalidad es 1→N diagramas raíz, y el `Cascade` de la auto-relación borraría todos los procesos del usuario). Macroprocesos como `Json` en la fila, igual que `actores`/`pasos`. Enlace hacia Nivel 2 duplicado —`Json` como fuente de verdad, `Diagram.valueMapId` como índice denormalizado con `SetNull`—, mismo patrón ya vigente para subprocesos. Sin `ValueMapVersion` (sobre-diseño; `borradorLlm` cubre el "volver atrás").

**Trial Nivel 1 (política cerrada, 2026-08-07 — §2.3):** el mapa de valor no consume cupo de diagramas y tiene contador propio con tope de 3 generaciones LLM. El cupo del trial pasa de "1 diagrama para siempre" a **1 proceso raíz detallado a la vez, rehacible sin límite**: se ocupa al detallar, se libera al borrar. Se implementa como **consulta derivada** (`count` de `Diagram` con `parentDiagramId: null` y `deletedAt: null`), **sin columna nueva** — el estado ya existe en la tabla y una copia solo se puede desincronizar. `trialDiagramsCreated` sobrevive como telemetría, fuera del gating. El `.bpmn` en trial es **idéntico al pago, sin marca de agua** (es lo que le permite al analista verificar el estándar antes de pagar); la marca "versión de evaluación" queda reservada para los entregables cara al cliente de Niveles 3-4, que no existen todavía. Ojo: el argumento del Incremento 2 ("no consume porque no llama al LLM") **no aplica** al mapa —sí llama—, pero la llamada es un orden de magnitud más barata.

**LLM Nivel 1:** propone `{nombre, categoria, descripcion}` y nada más. El código asigna ids, valida categorías y unicidad, y —clave— **el badge de "borrador" es un `if` sobre `confirmadoAt`, no una frase del prompt**. Así la condición 1 de §4 de la metodología es garantía y no buena intención.

**Contenido del Nivel 1 (incorporado 2026-08-07, §3.1-3.5):** nomenclatura obligatoria en el prompt —fórmula `Sustantivo de Gestión + Objeto`, 3-6 palabras, lista cerrada de sustantivos, prohibición de siglas/departamentos/infinitivos, tabla de conversiones few-shot—; cantidades **por categoría** (3-5 estratégicos, 3-6 core, 4-8 soporte). **Todo eso es regla del LLM: Zod nunca bloquea al usuario por nomenclatura**, solo frena salida degenerada (1-10 por categoría, tope 25). `revisarMapaValor` pasa de 2 a 4 avisos informativos (V3: categoría vacía o de un solo elemento; V4: desbalance grosero), y **V1/V3/V4 solo aplican con `alcance === "empresa"`**. Campo `alcance` nuevo en `ValueMap` (Empresa completa / Una unidad o área / Una sede), capturado en la pantalla. El agrupamiento por categoría **debe ser sort estable, nunca alfabético**: el orden del array es dato del usuario. Label `core` en UI: **"Del negocio"**, cerrado. Los modos de entrevista (10/20 preguntas) y los 3 perfiles de audiencia del prompt huérfano quedan **descartados a propósito** y derivados a PRODUCT MANAGER como candidata de tier de pago.

**Nivel 4:** tabla `Procedimiento(diagramId, pasoId)` con `@@unique`, **no** dentro del `Paso` — la razón decisiva es que `DiagramVersion` snapshotea `pasos` en cada mutación y clonaría el manual entero cada vez. Contenido Json estructurado (objetivo / precondiciones / instrucciones / resultado / excepciones / faltantes), no markdown libre.

**Disparo Nivel 4:** manual, por paso, y solo sobre `tarea`/`sistema`. Automática al confirmar sería 14 llamadas por proceso y 14 invenciones. **Restricción central: el contenido lo aporta el usuario en un prompt por paso; el LLM estructura, no inventa.** Es lo que §4 de la metodología ya decidió para los niveles 2-4.

**Completitud Nivel 4:** informativa, fuera de `evaluarCompletitud` (que es pura y síncrona, y perdería esa propiedad) y **nunca bloqueante** — bloquear convertiría en obligación un nivel que la metodología declara opcional.

**Sizing: M cada uno.** El Nivel 1 **sigue siendo M** con los siete ajustes del 2026-08-07: todos son S o menos, ninguno reabre el modelo de datos. Timeline lo confirma DEV.

**Independientes entre sí. Recomiendo Nivel 1 primero:** es el punto de entrada que hoy falta, tiene el riesgo más aislado, y deja tiempo para resolver con DISEÑADOR-UX el flujo de input por paso que el Nivel 4 necesita.

**Bloqueantes: ninguno para el Nivel 1.** El único que había (cupo de trial) quedó resuelto el 2026-08-07 y está en §2.3.

**Pendientes de PRODUCT MANAGER, que NO bloquean la primera tanda (Nivel 1):**
1. Tope de generaciones de procedimiento en trial (mi recomendación: 3) — §8, aplica recién al construir Nivel 4.
2. Marca "Generado con Mapea · versión de evaluación" en procedimientos y reporte de riesgos — §2.3 punto 4, aplica cuando esos entregables existan.
3. Orden de construcción, si prioriza monetización sobre completar el embudo — §10.
