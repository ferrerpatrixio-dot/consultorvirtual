import Link from "next/link";
import { Plus, FileText, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function Dashboard() {
  const user = await requireUser();
  // deletedAt: null (versionado, docs/DISENO-VERSIONADO-F02.md §5.2a): un
  // subproceso con borrado lógico no debe listarse. En la práctica esto
  // raramente filtra algo acá (los hijos no aparecen en /dashboard salvo
  // que el usuario navegue directo a su id), pero es la misma regla en
  // todas las consultas de listado/carga, sin excepción.
  const diagramas = await prisma.diagram.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Mis diagramas</h1>
          <p className="mt-1 text-sm text-ink-2">
            Un diagrama por cliente/proceso. Crea uno vacío y complétalo con
            actores y pasos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/diagramas/nuevo-ia"
            className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary-ink transition hover:bg-bg"
          >
            <Sparkles className="h-4 w-4" />
            Generar con IA
          </Link>
          <Link
            href="/diagramas/nuevo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Nuevo diagrama
          </Link>
        </div>
      </div>

      {diagramas.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-line bg-surface p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-ink-2" />
          <p className="mt-3 font-medium text-ink">Aún no tienes diagramas</p>
          <p className="mt-1 text-sm text-ink-2">
            Crea el primero para empezar a cargar actores y pasos.
          </p>
          <Link
            href="/diagramas/nuevo"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Crear el primero
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {diagramas.map((d) => (
            <li key={d.id}>
              <Link
                href={`/diagramas/${d.id}`}
                className="flex items-center justify-between rounded-xl border border-line bg-surface p-5 transition hover:border-primary"
              >
                <div>
                  <p className="font-bold text-ink">{d.cliente}</p>
                  <p className="text-sm text-ink-2">{d.proceso}</p>
                </div>
                <span className="text-xs text-ink-2">
                  Actualizado {d.updatedAt.toLocaleDateString("es-CL")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
