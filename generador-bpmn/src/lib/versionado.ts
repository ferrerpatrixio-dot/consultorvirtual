import { z } from "zod";
import type { Diagram, Prisma, PrismaClient } from "@prisma/client";

// Versionado (docs/DISENO-VERSIONADO-F02.md). Único camino a
// `prisma.diagram.update` para las acciones mutadoras de actions.ts —
// cualquier acción nueva que escriba un Diagram directo, sin pasar por
// `mutarDiagramaVersionado`, es un agujero silencioso en el historial.

export type OperacionVersion =
  | "editar_meta"
  | "editar_actores"
  | "agregar_paso"
  | "editar_paso"
  | "mover_paso"
  | "quitar_paso"
  | "descomponer"
  | "reconocer_hueco"
  | "restaurar";
// "generacion_inicial" (§1.3 del diseño) NO se persiste nunca: es el seq 0
// implícito, el estado con el que nació el diagrama.

const VENTANA_COALESCENCIA_MS = 5 * 60 * 1000;
const RETENCION_MAXIMA = 50;

/** Operaciones destructivas o de gran alcance que SIEMPRE crean su propia
 * versión, aunque sean consecutivas a la anterior (§2.1 del diseño): acá el
 * usuario quiere un punto de retorno preciso, no agrupado. */
const NUNCA_COALESCEN: ReadonlySet<OperacionVersion> = new Set([
  "quitar_paso",
  "descomponer",
  "restaurar",
]);

type UltimaVersion = { seq: number; operacion: string; detalle: string | null; createdAt: Date } | null;

/** Regla de coalescencia (§2.1): no se crea versión nueva si la última
 * versión del diagrama tiene menos de 5 minutos, misma operación y mismo
 * detalle (mismo pasoId afectado). Función pura para poder testearla sin
 * BD — la lógica de acceso a datos vive en mutarDiagramaVersionado. */
export function debeCoalescer(
  ultima: UltimaVersion,
  operacion: OperacionVersion,
  detalle: string | undefined,
  ahora: Date,
): boolean {
  if (!ultima) return false;
  if (NUNCA_COALESCEN.has(operacion)) return false;
  if (ultima.operacion !== operacion) return false;
  if ((ultima.detalle ?? undefined) !== detalle) return false;
  return ahora.getTime() - ultima.createdAt.getTime() < VENTANA_COALESCENCIA_MS;
}

/** Envuelve una mutación de Diagram: inserta la imagen previa como
 * DiagramVersion (salvo coalescencia), aplica el update, y poda la
 * retención. Todo dentro de la transacción que ya trae `tx` — no anida
 * transacciones (§2.2 del diseño). `diagrama` es el estado ACTUAL, ya
 * leído y autorizado por el caller. */
export async function mutarDiagramaVersionado(
  tx: Prisma.TransactionClient,
  diagrama: Diagram,
  operacion: OperacionVersion,
  detalle: string | undefined,
  cambios: Prisma.DiagramUpdateInput,
): Promise<void> {
  const ultima = await tx.diagramVersion.findFirst({
    where: { diagramId: diagrama.id },
    orderBy: { seq: "desc" },
    select: { seq: true, operacion: true, detalle: true, createdAt: true },
  });

  if (!debeCoalescer(ultima, operacion, detalle, new Date())) {
    const seq = (ultima?.seq ?? 0) + 1;
    // @@unique([diagramId, seq]) es la red de seguridad ante dos pestañas
    // editando a la vez (§2.2): si choca, la transacción falla y el
    // caller reintenta (comportamiento default de Prisma ante P2002 no
    // capturado acá — no lo capturamos porque el producto es mono-usuario
    // y el caso es raro; documentado, no resuelto en este corte, ver §7.1
    // del diseño).
    await tx.diagramVersion.create({
      data: {
        diagramId: diagrama.id,
        userId: diagrama.userId,
        seq,
        operacion,
        detalle: detalle ?? null,
        actores: diagrama.actores as Prisma.InputJsonValue,
        pasos: diagrama.pasos as Prisma.InputJsonValue,
        huecosReconocidos: diagrama.huecosReconocidos as Prisma.InputJsonValue,
        cliente: diagrama.cliente,
        proceso: diagrama.proceso,
      },
    });

    await podarRetencion(tx, diagrama.id);
  }

  await tx.diagram.update({ where: { id: diagrama.id }, data: cambios });
}

const pasoSubprocesoSchema = z.object({
  tipo: z.string(),
  subprocesoDiagramId: z.string().optional(),
});

/** Ids de Diagram que un array `pasos` (Json crudo) referencia como
 * subprocesos. Usado tanto para la purga de huérfanos (abajo) como para la
 * reconciliación al restaurar (ver reconciliarSubprocesos). */
export function idsSubprocesoDePasos(pasos: unknown): string[] {
  const r = z.array(pasoSubprocesoSchema).safeParse(pasos);
  if (!r.success) return [];
  return r.data
    .filter((p) => p.tipo === "subproceso" && p.subprocesoDiagramId)
    .map((p) => p.subprocesoDiagramId!);
}

/** Poda a las últimas RETENCION_MAXIMA versiones (§4 del diseño): borra la
 * más antigua si se excede. Además, si la versión borrada era la única que
 * todavía referenciaba un subproceso con borrado lógico, ese subproceso se
 * vuelve irrecuperable y se purga físicamente (§5.2a: "un hijo se vuelve
 * irrecuperable recién cuando ninguna versión conservada lo menciona" — es
 * la única regla de purga, derivada, no configurable). Best-effort: solo
 * mira las versiones del mismo diagrama (el único lugar donde puede
 * aparecer un paso "subproceso" que enlaza a ese hijo). */
async function podarRetencion(tx: Prisma.TransactionClient, diagramId: string): Promise<void> {
  const total = await tx.diagramVersion.count({ where: { diagramId } });
  if (total <= RETENCION_MAXIMA) return;

  const masAntigua = await tx.diagramVersion.findFirst({
    where: { diagramId },
    orderBy: { seq: "asc" },
  });
  if (!masAntigua) return;

  const idsReferenciados = idsSubprocesoDePasos(masAntigua.pasos);
  await tx.diagramVersion.delete({ where: { id: masAntigua.id } });

  if (idsReferenciados.length === 0) return;

  // idsSubprocesoDePasos requiere leer `pasos` de cada versión restante;
  // con la retención acotada a 50 filas por diagrama esto es barato.
  const versionesRestantes = await tx.diagramVersion.findMany({
    where: { diagramId },
    select: { pasos: true },
  });
  for (const hijoId of idsReferenciados) {
    const sigueReferenciado = versionesRestantes.some((v) =>
      idsSubprocesoDePasos(v.pasos).includes(hijoId),
    );
    if (sigueReferenciado) continue;

    const hijo = await tx.diagram.findUnique({ where: { id: hijoId }, select: { deletedAt: true } });
    if (hijo?.deletedAt) {
      await tx.diagram.delete({ where: { id: hijoId } }); // cascada sobre sus propios descendientes
    }
  }
}

/** Marca `deletedAt` en un Diagram y todo su subárbol (BFS por
 * parentDiagramId) — reemplaza el `prisma.diagram.delete` físico que hacía
 * quitarPasoAction (§5.2a del diseño). Idempotente: si ya estaba borrado,
 * no hace nada raro (solo re-escribe la marca de tiempo del nodo raíz del
 * subárbol que se está borrando ahora). */
export async function marcarBorradoLogicoSubarbol(
  tx: Prisma.TransactionClient,
  raizId: string,
): Promise<void> {
  const ahora = new Date();
  let frontera = [raizId];
  while (frontera.length > 0) {
    await tx.diagram.updateMany({ where: { id: { in: frontera } }, data: { deletedAt: ahora } });
    const hijos = await tx.diagram.findMany({
      where: { parentDiagramId: { in: frontera } },
      select: { id: true },
    });
    frontera = hijos.map((h) => h.id);
  }
}

/** Revive (`deletedAt: null`) un Diagram y todo su subárbol que siga
 * marcado como borrado lógico. Usado por restaurarVersionAction cuando la
 * versión destino referencia un subproceso que fue borrado después
 * (§5.2b, caso "En V, no en A"). No revive un nodo que fue purgado
 * físicamente — ese caso se degrada, no se revive (ver reconciliarSubprocesos). */
export async function revivirSubarbol(tx: Prisma.TransactionClient, raizId: string): Promise<void> {
  let frontera = [raizId];
  while (frontera.length > 0) {
    await tx.diagram.updateMany({
      where: { id: { in: frontera }, deletedAt: { not: null } },
      data: { deletedAt: null },
    });
    const hijos = await tx.diagram.findMany({
      where: { parentDiagramId: { in: frontera } },
      select: { id: true },
    });
    frontera = hijos.map((h) => h.id);
  }
}

export type CasoReconciliacion =
  | { subprocesoDiagramId: string; caso: "sobrevive" }
  | { subprocesoDiagramId: string; caso: "revivir" }
  | { subprocesoDiagramId: string; caso: "degradar" }
  | { subprocesoDiagramId: string; caso: "borrado_logico" };

/** Tabla de reconciliación de subprocesos al restaurar (§5.2b del diseño),
 * como función pura y testeable — la parte de mayor riesgo de datos de
 * todo el incremento:
 *
 * | En V | En A | ¿vivo hoy? | Caso        |
 * |------|------|-----------|-------------|
 * |  sí  |  sí  |     -     | sobrevive   |
 * |  sí  |  no  |    sí (borrado lógico) | revivir |
 * |  sí  |  no  |    no (purgado)        | degradar |
 * |  no  |  sí  |     -     | borrado_logico |
 *
 * `idsVivos`/`idsBorrados`: partición de los ids que EXISTEN hoy en BD
 * (borrado lógico o no). Un id que no está en ninguno de los dos conjuntos
 * fue purgado físicamente. */
export function reconciliarSubprocesos(
  idsVersionDestino: string[],
  idsEstadoActual: string[],
  idsVivos: ReadonlySet<string>,
  idsBorrados: ReadonlySet<string>,
): CasoReconciliacion[] {
  const enV = new Set(idsVersionDestino);
  const enA = new Set(idsEstadoActual);
  const resultado: CasoReconciliacion[] = [];

  for (const id of enV) {
    if (enA.has(id)) {
      resultado.push({ subprocesoDiagramId: id, caso: "sobrevive" });
    } else if (idsBorrados.has(id)) {
      resultado.push({ subprocesoDiagramId: id, caso: "revivir" });
    } else if (idsVivos.has(id)) {
      // Estaba vivo pero no en A: dato inconsistente (no debería pasar si
      // A refleja el estado real), se trata igual que "sobrevive" — no hay
      // nada que reconciliar, sigue existiendo.
      resultado.push({ subprocesoDiagramId: id, caso: "sobrevive" });
    } else {
      resultado.push({ subprocesoDiagramId: id, caso: "degradar" });
    }
  }
  for (const id of enA) {
    if (!enV.has(id)) {
      resultado.push({ subprocesoDiagramId: id, caso: "borrado_logico" });
    }
  }
  return resultado;
}

/** Etiqueta legible para el panel de historial (§3.1: "el copy exacto lo
 * define DISEÑADOR-UX; yo solo garantizo que el dato está en la fila" —
 * esto es un placeholder funcional, no el copy final). */
export function etiquetaOperacion(operacion: string, detalle: string | null): string {
  const base: Record<string, string> = {
    editar_meta: "Se editó cliente/proceso",
    editar_actores: "Se editaron los actores",
    agregar_paso: "Se agregó un paso",
    editar_paso: "Se editó un paso",
    mover_paso: "Se reordenó un paso",
    quitar_paso: "Se quitó un paso",
    descomponer: "Se descompuso en subproceso",
    reconocer_hueco: "Se reconoció un punto pendiente",
    restaurar: "Se restauró una versión anterior",
  };
  const texto = base[operacion] ?? operacion;
  return detalle ? `${texto} «${detalle}»` : texto;
}

// Tipo mínimo usado por raizDe/contarDescendientes en descomposicion.ts,
// reexportado acá para que restaurarVersionAction pueda tipar sin acoplarse
// a PrismaClient completo si algún día se separa el cliente de test.
export type { PrismaClient };
