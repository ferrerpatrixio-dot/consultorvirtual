"use client";

/** Botón "Eliminar" de un paso, con confirmación nativa cuando el paso es
 * "subproceso" (mismo patrón que EliminarDiagramaButton). Si se borra un
 * paso subproceso, quitarPasoAction también borra el Diagram hijo completo
 * en cascada (ver comentario en actions.ts) — el usuario no puede darse
 * cuenta de eso mirando la fila, así que hay que decírselo antes de que
 * pase. Pasos normales no muestran confirmación: no hay riesgo de pérdida
 * de datos ocultos y agregaría fricción innecesaria. */
export function QuitarPasoButton({
  esSubproceso,
  nombreSubproceso,
  cantidadPasosSubproceso,
}: {
  esSubproceso: boolean;
  nombreSubproceso?: string;
  cantidadPasosSubproceso?: number;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!esSubproceso) return;
        const nombre = nombreSubproceso || "(sin nombre)";
        const cantidad = cantidadPasosSubproceso ?? 0;
        if (
          !confirm(
            `Esto también va a borrar el subproceso "${nombre}" y sus ${cantidad} pasos. Podés deshacerlo desde el Historial.`
          )
        ) {
          e.preventDefault();
        }
      }}
      className="ml-3 cursor-pointer text-danger hover:underline"
    >
      Eliminar
    </button>
  );
}
