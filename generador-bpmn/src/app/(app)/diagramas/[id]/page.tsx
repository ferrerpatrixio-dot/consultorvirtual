import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseActores, parsePasos, TIPOS_PASO, TIPO_LABEL } from "@/lib/diagramas";
import {
  actualizarMetaAction,
  eliminarDiagramaAction,
  agregarActorAction,
  quitarActorAction,
  agregarPasoAction,
  actualizarPasoAction,
  quitarPasoAction,
} from "@/app/(app)/actions";
import { EliminarDiagramaButton } from "./EliminarDiagramaButton";

const LABEL = "block text-sm font-medium text-ink";
const INPUT =
  "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";

export default async function DiagramaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ editId?: string }>;
}) {
  const { id } = await params;
  const { editId } = await searchParams;
  const user = await requireUser();

  const diagrama = await prisma.diagram.findFirst({
    where: { id, userId: user.id },
  });
  if (!diagrama) redirect("/dashboard");

  const actores = parseActores(diagrama.actores);
  const pasos = parsePasos(diagrama.pasos);
  const pasoEnEdicion = editId ? pasos.find((p) => p.id === editId) : undefined;

  // Opciones de destino: cualquier otro paso del diagrama (no el que se
  // está editando, para no dejarlo apuntándose a sí mismo).
  const opcionesDestino = pasos.filter((p) => p.id !== pasoEnEdicion?.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-2 transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Mis diagramas
        </Link>
        <form action={eliminarDiagramaAction}>
          <input type="hidden" name="diagramId" value={diagrama.id} />
          <EliminarDiagramaButton />
        </form>
      </div>

      {/* Cliente / proceso */}
      <section className="mt-6 rounded-xl border border-line bg-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-primary-ink">
          Cliente y proceso
        </h2>
        <form action={actualizarMetaAction} className="mt-3 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="diagramId" value={diagrama.id} />
          <div>
            <label className={LABEL} htmlFor="cliente">
              Cliente
            </label>
            <input
              id="cliente"
              name="cliente"
              defaultValue={diagrama.cliente}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="proceso">
              Proceso
            </label>
            <input
              id="proceso"
              name="proceso"
              defaultValue={diagrama.proceso}
              className={INPUT}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-bg"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </section>

      {/* Actores */}
      <section className="mt-6 rounded-xl border border-line bg-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-primary-ink">
          Actores (carriles)
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {actores.length === 0 && (
            <p className="text-sm text-ink-2">Sin actores todavía.</p>
          )}
          {actores.map((a) => (
            <form key={a} action={quitarActorAction} className="contents">
              <input type="hidden" name="diagramId" value={diagrama.id} />
              <input type="hidden" name="nombre" value={a} />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-bg px-3 py-1 text-sm font-medium text-ink">
                {a}
                <button
                  type="submit"
                  title="Quitar"
                  className="cursor-pointer rounded-full p-0.5 text-ink-2 hover:text-danger"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            </form>
          ))}
        </div>
        <form action={agregarActorAction} className="mt-4 flex gap-2">
          <input type="hidden" name="diagramId" value={diagrama.id} />
          <input
            name="nombre"
            placeholder="Ej. Bodeguero"
            className={`${INPUT} mt-0 flex-1`}
          />
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            + Agregar
          </button>
        </form>
      </section>

      {/* Pasos */}
      <section className="mt-6 rounded-xl border border-line bg-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-primary-ink">
          Pasos del proceso
        </h2>

        {pasos.length === 0 ? (
          <p className="mt-3 text-sm text-ink-2">Sin pasos todavía.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-ink-2">
                  <th className="py-2 pr-2">Actor</th>
                  <th className="py-2 pr-2">Tipo</th>
                  <th className="py-2 pr-2">Texto</th>
                  <th className="py-2 pr-2">Destino</th>
                  <th className="py-2 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {pasos.map((p) => (
                  <tr key={p.id} className="border-b border-line">
                    <td className="py-2 pr-2">{p.actor || "—"}</td>
                    <td className="py-2 pr-2">{TIPO_LABEL[p.tipo]}</td>
                    <td className="py-2 pr-2">{p.texto || "(sin texto)"}</td>
                    <td className="py-2 pr-2 text-xs text-ink-2">
                      {p.tipo === "decision"
                        ? `Sí→${p.siguienteSi ?? "—"} · No→${p.siguienteNo ?? "—"}`
                        : p.siguiente ?? "—"}
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap">
                      <Link
                        href={`/diagramas/${diagrama.id}?editId=${p.id}`}
                        className="text-primary-ink hover:underline"
                      >
                        Editar
                      </Link>
                      <form action={quitarPasoAction} className="inline">
                        <input type="hidden" name="diagramId" value={diagrama.id} />
                        <input type="hidden" name="pasoId" value={p.id} />
                        <button
                          type="submit"
                          className="ml-3 cursor-pointer text-danger hover:underline"
                        >
                          Eliminar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Formulario agregar / editar paso. Todos los campos de destino se
            muestran siempre (sin JS de cliente): el servidor descarta los que
            no aplican al tipo elegido (ver normalizarDestinos en actions.ts). */}
        <form
          action={pasoEnEdicion ? actualizarPasoAction : agregarPasoAction}
          className="mt-5 space-y-3 rounded-lg border border-line bg-bg p-4"
        >
          <input type="hidden" name="diagramId" value={diagrama.id} />
          {pasoEnEdicion && (
            <input type="hidden" name="pasoId" value={pasoEnEdicion.id} />
          )}
          <p className="text-xs font-bold uppercase tracking-wide text-ink-2">
            {pasoEnEdicion ? "Editar paso" : "Agregar paso"}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={LABEL} htmlFor="actor">
                Actor
              </label>
              <select
                id="actor"
                name="actor"
                defaultValue={pasoEnEdicion?.actor ?? actores[0] ?? ""}
                className={INPUT}
              >
                <option value="">— sin actor —</option>
                {actores.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="tipo">
                Tipo
              </label>
              <select
                id="tipo"
                name="tipo"
                defaultValue={pasoEnEdicion?.tipo ?? "tarea"}
                className={INPUT}
              >
                {TIPOS_PASO.map((t) => (
                  <option key={t} value={t}>
                    {TIPO_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="texto">
                Texto
              </label>
              <input
                id="texto"
                name="texto"
                defaultValue={pasoEnEdicion?.texto ?? ""}
                placeholder="Ej. Verifica cantidades"
                className={INPUT}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={LABEL} htmlFor="siguiente">
                Siguiente (si no es decisión ni fin)
              </label>
              <select
                id="siguiente"
                name="siguiente"
                defaultValue={pasoEnEdicion?.siguiente ?? ""}
                className={INPUT}
              >
                <option value="">— automático / sin destino —</option>
                {opcionesDestino.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.texto || "(sin texto)"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="siguienteSi">
                Si es decisión: Sí →
              </label>
              <select
                id="siguienteSi"
                name="siguienteSi"
                defaultValue={pasoEnEdicion?.siguienteSi ?? ""}
                className={INPUT}
              >
                <option value="">— elegir —</option>
                {opcionesDestino.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.texto || "(sin texto)"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="siguienteNo">
                Si es decisión: No →
              </label>
              <select
                id="siguienteNo"
                name="siguienteNo"
                defaultValue={pasoEnEdicion?.siguienteNo ?? ""}
                className={INPUT}
              >
                <option value="">— elegir —</option>
                {opcionesDestino.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.texto || "(sin texto)"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {pasoEnEdicion ? "Guardar cambios" : "+ Agregar paso"}
            </button>
            {pasoEnEdicion && (
              <Link
                href={`/diagramas/${diagrama.id}`}
                className="inline-flex items-center rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-surface"
              >
                Cancelar
              </Link>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
