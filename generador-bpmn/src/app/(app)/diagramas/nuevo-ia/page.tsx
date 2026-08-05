import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireCreationAccess } from "@/lib/session";
import { NuevoDiagramaIAForm } from "./NuevoDiagramaIAForm";

// requireCreationAccess redirige a /suscripcion (con mensaje + precio) si el
// usuario ya agotó su cupo de trial o el trial venció — antes de mostrar el
// formulario, no solo al enviarlo. Ver src/lib/session.ts.
export default async function NuevoDiagramaIAPage() {
  await requireCreationAccess();

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink-2 transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-ink">
        Generar diagrama con IA
      </h1>
      <p className="mt-1 text-sm text-ink-2">
        Describe el proceso en tus palabras. La IA arma actores y pasos por
        ti; lo que no le quede claro te lo va a preguntar en la página
        siguiente, y siempre puedes editarlo a mano después.
      </p>

      <NuevoDiagramaIAForm />
    </main>
  );
}
