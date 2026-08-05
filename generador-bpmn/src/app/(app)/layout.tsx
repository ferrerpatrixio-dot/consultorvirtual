import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireActiveSubscription } from "@/lib/session";
import { logout } from "@/app/auth-actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // requireActiveSubscription cubre login + suscripción: protege todo lo que
  // cuelga de este grupo de rutas (/dashboard, /diagramas/*) — Fase 5.
  const user = await requireActiveSubscription();

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
