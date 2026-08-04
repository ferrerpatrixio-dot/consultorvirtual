"use client";

import { Trash2 } from "lucide-react";

/** Botón de borrado con confirmación nativa — único fragmento de este flujo
 * que necesita ser Client Component (window.confirm no existe en el
 * servidor). Todo lo demás en esta página es Server Components + form
 * actions planos. */
export function EliminarDiagramaButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm("¿Eliminar este diagrama? No se puede deshacer.")) {
          e.preventDefault();
        }
      }}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-danger px-3 py-1.5 text-sm font-medium text-danger transition hover:bg-danger hover:text-white"
    >
      <Trash2 className="h-4 w-4" />
      Eliminar diagrama
    </button>
  );
}
