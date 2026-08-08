import { prisma } from "@/lib/prisma";

/** Duración del Free Trial: 3 días desde el registro (User.createdAt). Sin
 * columna propia de vencimiento — se calcula al vuelo (createdAt + 3 días)
 * porque no hace falta persistir un dato que ya se deriva de uno existente.
 * Ver docs/VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md sección 8. */
export const TRIAL_DIAS = 3;

/** HISTÓRICO — ya no gobierna el gating de creación (ver
 * TRIAL_MAX_RAICES_SIMULTANEAS más abajo). Se conserva la constante y el
 * contador (User.trialDiagramsCreated) solo como telemetría: cuántas
 * generaciones acumuló un usuario antes de convertir. No la reutilices para
 * bloquear nada nuevo — es exactamente el dato que la política vieja usaba
 * y que se reemplazó (docs/DISENO-NIVELES-1-4-F02.md §2.3.1). */
export const TRIAL_MAX_DIAGRAMAS = 1;

/** Cupo de trial — política de SLOT REHACIBLE, resuelta el 2026-08-07
 * (docs/DISENO-NIVELES-1-4-F02.md §2.3, aprobada por Patricio tras revisión
 * de ANALISTA-PROCESOS-NEGOCIO). Reemplaza a la política anterior de
 * "1 diagrama para siempre, contador que solo sube".
 *
 * Durante el trial el usuario puede tener UN (1) proceso raíz detallado a
 * la vez, y puede rehacerlo o reemplazarlo las veces que quiera: borrar el
 * que tiene y detallar otro macroproceso, o regenerar el mismo con un
 * prompt mejor. Lo único que no puede es tener dos procesos raíz detallados
 * en simultáneo — eso es lo que se cobra (capacidad simultánea, no intento).
 *
 * Se implementa como CONSULTA DERIVADA, sin columna nueva: el estado ya
 * existe en la tabla Diagram (parentDiagramId: null, deletedAt: null) y
 * copiarlo a un contador incremental/decremental es la forma en que un bug
 * de borrado deja al usuario trabado en un cupo fantasma, sin poder
 * destrabarse solo. Los dos caminos de borrado que ya existen
 * (eliminarDiagramaAction: borrado físico; marcarBorradoLogicoSubarbol:
 * deletedAt) dejan el estado correcto sin que nadie tenga que mantenerlos
 * sincronizados con este gating. Verificado: ningún camino resucita hoy una
 * raíz (revivirSubarbol solo se invoca sobre subprocesoDiagramId, siempre un
 * hijo) — si alguna vez se agrega "restaurar diagrama borrado" a nivel
 * raíz, esa acción tiene que pasar por este mismo gating.
 *
 * Riesgo asumido y explícito: con slot rehacible, borrar y regenerar
 * dispara generarDesdePromptAction (la llamada cara al LLM) sin techo de
 * llamadas — el trial de 3 días es el único límite natural. Si el costo de
 * API se vuelve visible, la mitigación NO es volver a este cupo de 1 raíz
 * — eso deshace la decisión de producto — sino poner un techo alto sobre
 * trialDiagramsCreated (telemetría de arriba), que ningún usuario legítimo
 * alcanza. No se implementa ahora: sería optimizar contra un problema que
 * nadie midió. */
export const TRIAL_MAX_RAICES_SIMULTANEAS = 1;

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export type EstadoAcceso = {
  suscripcionActiva: boolean;
  trialActivo: boolean;
  /** Días de trial restantes, redondeados hacia arriba (0 si no aplica). */
  trialDiasRestantes: number;
  /** Puede entrar a ver/usar la app (dashboard, ver y editar diagramas
   * existentes): suscripción activa, o trial vigente aunque ya haya
   * agotado su cupo de creación. */
  puedeUsarApp: boolean;
  /** Puede crear un diagrama RAÍZ nuevo (manual o por IA): suscripción
   * activa, o trial vigente con el slot de raíz simultánea libre (§2.3.1
   * en trial.ts — ya no depende de trialDiagramsCreated). Descomponer en
   * subprocesos NO pasa por acá (sin cupo, decisión ya vigente antes de
   * esta política). */
  puedeCrearDiagrama: boolean;
  /** Puede generar/regenerar el borrador LLM del Mapa de Valor (Nivel 1):
   * suscripción activa, o trial vigente con trialValueMapsCreated < 3. El
   * mapa de valor en sí (editar, confirmar) no tiene tope — solo la
   * llamada al LLM. Ver docs/DISENO-NIVELES-1-4-F02.md §2.2. */
  puedeGenerarMapaValor: boolean;
};

const TRIAL_MAX_MAPAS_VALOR = 3;

/** Evalúa el acceso del usuario para el gating de trial/suscripción. Fuente
 * de verdad única, usada tanto por src/lib/session.ts (requireAppAccess /
 * requireCreationAccess, que protegen páginas y Server Actions) como por la
 * UI (indicador de días restantes en el layout). */
export async function evaluarAcceso(userId: string): Promise<EstadoAcceso> {
  const registro = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      createdAt: true,
      trialValueMapsCreated: true,
    },
  });

  const suscripcionActiva = registro?.subscriptionStatus === "authorized";
  const creadoEn = registro?.createdAt ?? new Date();
  const msRestantes = creadoEn.getTime() + TRIAL_DIAS * MS_POR_DIA - Date.now();
  const trialActivo = !suscripcionActiva && msRestantes > 0;
  const trialDiasRestantes = trialActivo
    ? Math.max(1, Math.ceil(msRestantes / MS_POR_DIA))
    : 0;
  const mapasValorUsados = registro?.trialValueMapsCreated ?? 0;

  // Slot rehacible (§2.3.1): se deriva del estado real de Diagram, nunca de
  // un contador copiado. Solo se consulta si hace falta — evita el count
  // en el camino de suscripción activa, que nunca lo necesita.
  let raicesActivas = 0;
  if (!suscripcionActiva && trialActivo) {
    raicesActivas = await prisma.diagram.count({
      where: { userId, parentDiagramId: null, deletedAt: null },
    });
  }

  return {
    suscripcionActiva,
    trialActivo,
    trialDiasRestantes,
    puedeUsarApp: suscripcionActiva || trialActivo,
    puedeCrearDiagrama:
      suscripcionActiva || (trialActivo && raicesActivas < TRIAL_MAX_RAICES_SIMULTANEAS),
    puedeGenerarMapaValor:
      suscripcionActiva || (trialActivo && mapasValorUsados < TRIAL_MAX_MAPAS_VALOR),
  };
}

/** Suma 1 al contador de diagramas creados en trial. Ya NO gobierna ningún
 * gating (§2.3.1) — sobrevive como telemetría pura: cuántas generaciones
 * acumuló un usuario antes de convertir. Se llama incondicionalmente desde
 * las Server Actions de creación (crearDiagramaAction,
 * generarDesdePromptAction en src/app/(app)/actions.ts) justo después de
 * crear el diagrama — no hace falta condicionarlo a que el usuario esté en
 * trial, porque evaluarAcceso() ignora este contador para usuarios con
 * suscripción activa. */
export async function registrarDiagramaDeTrial(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { trialDiagramsCreated: { increment: 1 } },
  });
}

/** Suma 1 al contador de generaciones del borrador LLM del Mapa de Valor
 * (User.trialValueMapsCreated). A diferencia de registrarDiagramaDeTrial,
 * este SÍ gobierna gating (puedeGenerarMapaValor, tope de 3). Se llama
 * desde la Server Action que dispara la llamada al LLM (generación/
 * regeneración del borrador), nunca desde la edición/confirmación local. */
export async function registrarMapaValorDeTrial(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { trialValueMapsCreated: { increment: 1 } },
  });
}
