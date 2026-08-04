import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NuevoDiagramaForm } from "./NuevoDiagramaForm";

export default function NuevoDiagramaPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink-2 transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-ink">Nuevo diagrama</h1>
      <p className="mt-1 text-sm text-ink-2">
        Se crea vacío. Los actores y pasos se agregan después, a mano. ¿Tienes
        una descripción del proceso escrita?{" "}
        <Link href="/diagramas/nuevo-ia" className="text-primary-ink underline">
          Genera el diagrama con IA
        </Link>{" "}
        en vez de armarlo campo por campo.
      </p>

      <NuevoDiagramaForm />
    </main>
  );
}
