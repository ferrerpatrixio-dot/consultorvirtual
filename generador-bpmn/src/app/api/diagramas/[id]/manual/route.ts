import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAppAccess } from "@/lib/session";
import { parsePasos } from "@/lib/diagramas";
import { generarManualMarkdown, parseContenidoProcedimiento, type ProcedimientoContenido } from "@/lib/procedimientos";

/** Descarga el manual operativo del proceso (Nivel 4 de F02, §6.4 del
 * diseño): un .md por diagrama, con los procedimientos documentados. NUNCA
 * bloqueante — a diferencia de la exportación .bpmn, un manual incompleto
 * es exactamente lo que se entrega: declara su propia cobertura al inicio,
 * nunca oculta el hueco. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireAppAccess();
  const { id } = await params;

  const diagrama = await prisma.diagram.findFirst({ where: { id, userId: user.id, deletedAt: null } });
  if (!diagrama) {
    return NextResponse.json({ error: "Diagrama no encontrado." }, { status: 404 });
  }

  const pasos = parsePasos(diagrama.pasos);
  const procedimientos = await prisma.procedimiento.findMany({
    where: { diagramId: diagrama.id, deletedAt: null },
  });

  const porPasoId = new Map<string, ProcedimientoContenido>();
  for (const p of procedimientos) {
    const contenido = parseContenidoProcedimiento(p.contenido);
    if (contenido) porPasoId.set(p.pasoId, contenido);
  }

  const md = generarManualMarkdown(diagrama.proceso, pasos, porPasoId);

  const nombreBase = diagrama.proceso.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "diagrama";

  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="manual-${nombreBase}.md"`,
    },
  });
}
