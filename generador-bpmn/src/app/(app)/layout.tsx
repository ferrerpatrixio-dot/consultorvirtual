import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireAppAccess } from "@/lib/session";
import { evaluarAcceso } from "@/lib/trial";
import { logout } from "@/app/auth-actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // requireAppAccess cubre login + (suscripción activa o trial de 3 días
  // vigente): protege todo lo que cuelga de este grupo de rutas (/dashboard,
  // /diagramas/*) — Fase 5 + Free Trial (ver src/lib/trial.ts). El límite de
  // "1 diagrama" del trial se controla aparte, en las páginas/acciones de
  // creación (requireCreationAccess), no acá — un usuario en trial que ya
  // usó su cupo igual puede ver el dashboard y editar lo que ya tiene.
  const user = await requireAppAccess();
  const acceso = await evaluarAcceso(user.id);

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-xs font-bold text-white">
              BP
            </span>
            <span className="font-bold text-ink">Generador BPMN</span>
          </Link>
          <div className="flex items-center gap-4">
            {acceso.trialActivo && (
              <span className="rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary-ink">
                Te quedan {acceso.trialDiasRestantes}{" "}
                {acceso.trialDiasRestantes === 1 ? "día" : "días"} de prueba
              </span>
            )}
            <span className="hidden text-sm text-ink-2 sm:inline">
              {user.name ?? user.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-2 transition hover:bg-bg"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
