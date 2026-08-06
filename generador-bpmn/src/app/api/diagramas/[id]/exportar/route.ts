import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAppAccess } from "@/lib/session";
import { parseActores, parsePasos } from "@/lib/diagramas";
import { exportarBpmn } from "@/lib/exportar-bpmn";
import { evaluarCompletitud, tienePendientesSinResolver } from "@/lib/completitud";

/** Descarga el diagrama como .bpmn (XML BPMN 2.0), ver Fase 3
 * (docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md "Actualización
 * 2026-08-04"). Ruta API en vez de server action porque el resultado es un
 * archivo con Content-Type/Content-Disposition propios, no una mutación de
 * formulario. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireAppAccess();
  const { id } = await params;

  const diagrama = await prisma.diagram.findFirst({ where: { id, userId: user.id } });
  if (!diagrama) {
    return NextResponse.json({ error: "Diagrama no encontrado." }, { status: 404 });
  }

  const actores = parseActores(diagrama.actores);
  const pasos = parsePasos(diagrama.pasos);

  // Bloqueo de exportación con pendientes sin resolver (spec F02 CA-12):
  // un hueco bloqueante o pendiente hace que el diagrama sea falso o esté
  // incompleto — en ambos casos no se exporta, aunque sí se puede seguir
  // viendo y editando en la app. Se recalcula acá (no se confía en un
  // estado guardado) porque cualquier edición nivel 1 posterior a la
  // generación puede haber vuelto a introducir un hueco.
  const huecos = evaluarCompletitud(pasos);
  if (tienePendientesSinResolver(huecos)) {
    return NextResponse.json(
      {
        error:
          "El diagrama tiene puntos sin resolver y no se puede exportar todavía. Corrígelos en el editor y vuelve a intentar.",
        huecos,
      },
      { status: 422 },
    );
  }

  let xml: string;
  try {
    xml = await exportarBpmn(actores, pasos);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "No se pudo generar el archivo .bpmn.",
      },
      { status: 422 },
    );
  }

  // Nombre de archivo derivado del proceso, saneado (sin caracteres que
  // rompan el header Content-Disposition).
  const nombreBase = diagrama.proceso.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "diagrama";

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombreBase}.bpmn"`,
    },
  });
}
