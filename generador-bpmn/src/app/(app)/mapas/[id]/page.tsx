import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { macroprocesosSchema, type Alcance } from "@/lib/valor";
import { MapaValorEditor } from "./MapaValorEditor";

export default async function MapaValorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const mapa = await prisma.valueMap.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  });
  if (!mapa) redirect("/dashboard");

  const parsed = macroprocesosSchema.safeParse(mapa.macroprocesos);
  const macroprocesos = parsed.success ? parsed.data : [];
  const alcance = mapa.alcance as Alcance;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink-2 transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis Mapas de Valor
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-ink">{mapa.cliente}</h1>
      <p className="mt-1 text-sm text-ink-2">Rubro: {mapa.rubro}</p>

      <MapaValorEditor
        valueMapId={mapa.id}
        macroprocesosIniciales={macroprocesos}
        alcance={alcance}
        confirmado={mapa.confirmadoAt !== null}
      />
    </main>
  );
}
