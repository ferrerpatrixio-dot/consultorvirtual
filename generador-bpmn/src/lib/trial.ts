import { prisma } from "@/lib/prisma";

/** Duración del Free Trial: 3 días desde el registro (User.createdAt). Sin
 * columna propia de vencimiento — se calcula al vuelo (createdAt + 3 días)
 * porque no hace falta persistir un dato que ya se deriva de uno existente.
 * Ver docs/VIABILIDAD-PRODUCT-MANAGER-BPMN-DESDE-PROMPT.md sección 8. */
export const TRIAL_DIAS = 3;

/** Cupo de diagramas del trial: 1 en total, para siempre (no por sesión ni
 * por día). Se cuenta con un contador persistente (User.trialDiagramsCreated,
 * ver prisma/schema.prisma) en vez de contar los Diagram que existen hoy,
 * porque el usuario puede borrar su diagrama (eliminarDiagramaAction ya
 * existía antes del trial) — un conteo en vivo permitiría generar uno nuevo
 * cada vez que borra el anterior, con costo real de API en cada intento
 * (generarDesdePromptAction). El contador solo sube, nunca baja. */
export const TRIAL_MAX_DIAGRAMAS = 1;

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
  /** Puede crear un diagrama nuevo (manual o por IA): suscripción activa,
   * o trial vigente con cupo todavía disponible. */
  puedeCrearDiagrama: boolean;
};

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
      trialDiagramsCreated: true,
    },
  });

  const suscripcionActiva = registro?.subscriptionStatus === "authorized";
  const creadoEn = registro?.createdAt ?? new Date();
  const msRestantes = creadoEn.getTime() + TRIAL_DIAS * MS_POR_DIA - Date.now();
  const trialActivo = !suscripcionActiva && msRestantes > 0;
  const trialDiasRestantes = trialActivo
    ? Math.max(1, Math.ceil(msRestantes / MS_POR_DIA))
    : 0;
  const diagramasUsados = registro?.trialDiagramsCreated ?? 0;

  return {
    suscripcionActiva,
    trialActivo,
    trialDiasRestantes,
    puedeUsarApp: suscripcionActiva || trialActivo,
    puedeCrearDiagrama:
      suscripcionActiva || (trialActivo && diagramasUsados < TRIAL_MAX_DIAGRAMAS),
  };
}

/** Suma 1 al contador de diagramas creados en trial. Se llama
 * incondicionalmente desde las Server Actions de creación
 * (crearDiagramaAction, generarDesdePromptAction en src/app/(app)/actions.ts)
 * justo después de crear el diagrama — no hace falta condicionarlo a que el
 * usuario esté en trial, porque evaluarAcceso() ignora este contador para
 * usuarios con suscripción activa. */
export async function registrarDiagramaDeTrial(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { trialDiagramsCreated: { increment: 1 } },
  });
}
