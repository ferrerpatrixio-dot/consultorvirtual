import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAppAccess } from "@/lib/session";
import { ALCANCES, ETIQUETAS_ALCANCE } from "@/lib/valor";
import { NuevoMapaForm } from "./NuevoMapaForm";

// requireAppAccess, NO requireCreationAccess: el mapa de valor no consume
// el cupo de diagramas raíz (§2.2 del diseño). El tope propio
// (trialValueMapsCreated < 3) se valida en crearMapaValorAction.
export default async function NuevoMapaValorPage() {
  await requireAppAccess();

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink-2 transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-ink">Nuevo Mapa de Valor</h1>
      <p className="mt-1 text-sm text-ink-2">
        Con el rubro de la empresa, proponemos un borrador de macroprocesos
        típicos del rubro — vas a poder editarlo, agregar, quitar y confirmar
        antes de usarlo.
      </p>

      <NuevoMapaForm alcances={ALCANCES} etiquetas={ETIQUETAS_ALCANCE} />
    </main>
  );
}
