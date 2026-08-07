import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseActores, parsePasos } from "@/lib/diagramas";
import { generarMermaid } from "@/lib/mermaid-render";
import { etiquetaOperacion } from "@/lib/versionado";
import { DiagramaPreview } from "../../DiagramaPreview";

/** "Ver" del historial (docs/DISENO-VERSIONADO-F02.md §3.1): renderiza el
 * diagrama de una versión pasada en modo lectura, reutilizando
 * mermaid-render.ts sin cambios (recibe actores/pasos, no le importa de
 * dónde salieron). Sin edición, sin exportación. */
export default async function VersionPage({
  params,
}: {
  params: Promise<{ id: string; versionId: string }>;
}) {
  const { id, versionId } = await params;
  const user = await requireUser();

  // Autoriza vía el Diagram del usuario, no vía DiagramVersion.userId
  // directo: si el diagrama fue eliminado o no es del usuario, no hay nada
  // que ver, aunque la fila de versión siga existiendo por cascada aún no
  // aplicada. deletedAt: null porque no tiene sentido ver el historial de
  // un subproceso que hoy está borrado lógicamente (se ve al restaurar el
  // padre, que lo revive primero).
  const diagrama = await prisma.diagram.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  });
  if (!diagrama) redirect("/dashboard");

  const version = await prisma.diagramVersion.findFirst({
    where: { id: versionId, diagramId: id },
  });
  if (!version) redirect(`/diagramas/${id}`);

  const actores = parseActores(version.actores);
  const pasos = parsePasos(version.pasos);
  const codigoMermaid = generarMermaid(actores, pasos);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/diagramas/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-2 transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al diagrama
      </Link>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5">
        <h1 className="text-sm font-bold uppercase tracking-wide text-primary-ink">
          {etiquetaOperacion(version.operacion, version.detalle)}
        </h1>
        <p className="mt-1 text-xs text-ink-2">
          {version.createdAt.toLocaleString("es-CL")} · vista de solo lectura
        </p>
        <div className="mt-3">
          <DiagramaPreview codigo={codigoMermaid} />
        </div>
      </section>
    </main>
  );
}
