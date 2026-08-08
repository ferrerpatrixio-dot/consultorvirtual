import Link from "next/link";
import { Plus, FileText, Sparkles, Map } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

// Nivel 1 de F02 (docs/DISENO-NIVELES-1-4-F02.md §2.4): deuda preexistente
// que el Nivel 1 agrava. Antes filtraba solo por { userId, deletedAt: null
// }, que mezclaba procesos raíz y subprocesos sueltos (parentDiagramId !=
// null) en la misma lista. Ahora: "Mis Mapas de Valor" arriba (ValueMap),
// "Mis Procesos" abajo (solo Diagram con parentDiagramId: null).
export default async function Dashboard() {
  const user = await requireUser();

  const [mapas, diagramas] = await Promise.all([
    prisma.valueMap.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.diagram.findMany({
      where: { userId: user.id, deletedAt: null, parentDiagramId: null },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      {/* Mis Mapas de Valor (Nivel 1) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Mis Mapas de Valor</h1>
          <p className="mt-1 text-sm text-ink-2">
            El punto de partida: la vista de macroprocesos de una empresa,
            antes de detallar cualquiera de ellos.
          </p>
        </div>
        <Link
          href="/mapas/nuevo"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <Map className="h-4 w-4" />
          Nuevo mapa de valor
        </Link>
      </div>

      {mapas.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line bg-surface p-8 text-center">
          <Map className="mx-auto h-7 w-7 text-ink-2" />
          <p className="mt-2 text-sm text-ink-2">
            Aún no tienes un mapa de valor. Es gratis y te muestra la
            estructura de macroprocesos de tu rubro.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {mapas.map((m) => (
            <li key={m.id}>
              <Link
                href={`/mapas/${m.id}`}
                className="flex items-center justify-between rounded-xl border border-line bg-surface p-5 transition hover:border-primary"
              >
                <div>
                  <p className="font-bold text-ink">{m.cliente}</p>
                  <p className="text-sm text-ink-2">{m.rubro}</p>
                </div>
                <span className="text-xs text-ink-2">
                  Actualizado {m.updatedAt.toLocaleDateString("es-CL")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Mis Procesos (Nivel 2+, solo raíces) */}
      <div className="mt-12 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Mis Procesos</h2>
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
        <div className="mt-6 rounded-xl border border-dashed border-line bg-surface p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-ink-2" />
          <p className="mt-3 font-medium text-ink">Aún no tienes diagramas</p>
          <p className="mt-1 text-sm text-ink-2">
            Crea el primero para empezar a cargar actores y pasos, o hazlo
            desde un mapa de valor.
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
        <ul className="mt-6 space-y-3">
          {diagramas.map((d) => (
            <li key={d.id}>
              <Link
                href={`/diagramas/${d.id}`}
                className="flex items-center justify-between rounded-xl border border-line bg-surface p-5 transition hover:border-primary"
              >
                <div>
                  <p className="font-bold text-ink">{d.cliente}</p>
                  <p className="text-sm text-ink-2">{d.proceso}</p>
                  {d.valueMapId && (
                    <p className="mt-0.5 text-xs text-ink-2">
                      Mapa de Valor › {d.proceso}
                    </p>
                  )}
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
