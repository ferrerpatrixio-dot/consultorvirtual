"use client";

import { useEffect, useId, useRef, useState } from "react";

/** Renderiza código Mermaid a SVG en el navegador. Import dinámico dentro de
 * useEffect porque mermaid toca el DOM (no puede cargarse en SSR).
 *
 * `resaltarNodoId` (opcional): id de nodo Mermaid ("n0", "n1"...) del paso
 * que se está editando (ver idNodoParaPaso en mermaid-render.ts). Si viene,
 * se le agrega un borde rojo en el SVG ya renderizado para dar foco visual. */
export function DiagramaPreview({
  codigo,
  resaltarNodoId,
}: {
  codigo: string | null;
  resaltarNodoId?: string;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const idBase = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    if (!codigo) {
      if (contenedorRef.current) contenedorRef.current.innerHTML = "";
      return;
    }

    import("mermaid").then(async ({ default: mermaid }) => {
      if (cancelado) return;
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
        flowchart: { curve: "basis" },
      });
      try {
        const { svg } = await mermaid.render(`diagrama_${idBase}`, codigo);
        if (!cancelado) {
          setError(null);
          if (contenedorRef.current) {
            contenedorRef.current.innerHTML = svg;
            if (resaltarNodoId) {
              const grupo = contenedorRef.current.querySelector(
                `[id^="flowchart-${resaltarNodoId}-"]`,
              );
              grupo
                ?.querySelectorAll("rect, polygon, circle, path")
                .forEach((forma) => {
                  (forma as SVGElement).style.stroke = "#dc3545";
                  (forma as SVGElement).style.strokeWidth = "4px";
                });
            }
          }
        }
      } catch (e) {
        if (!cancelado) {
          setError(e instanceof Error ? e.message : "No se pudo dibujar el diagrama.");
        }
      }
    });

    return () => {
      cancelado = true;
    };
  }, [codigo, idBase, resaltarNodoId]);

  if (!codigo) {
    return (
      <p className="rounded-lg border border-dashed border-line bg-bg p-6 text-center text-sm italic text-ink-2">
        Agrega actores y pasos para ver el diagrama.
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger bg-red-50 p-4 text-sm text-danger">
        No se pudo dibujar el diagrama todavía. Revisa que cada paso tenga
        texto y que las decisiones tengan Sí/No asignados.
      </div>
    );
  }

  return (
    <>
      <div
        ref={contenedorRef}
        className="flex min-h-[120px] items-center justify-center overflow-x-auto rounded-lg border border-line bg-white p-4"
      />
      <p className="mt-2 text-center text-xs italic text-ink-2">
        Esta vista es un borrador visual rápido, no un archivo BPMN — para el
        formato estándar (compatible con Bizagi, Camunda, etc.) descargá el
        archivo BPMN.
      </p>
    </>
  );
}
