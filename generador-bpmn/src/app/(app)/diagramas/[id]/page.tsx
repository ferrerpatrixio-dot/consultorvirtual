import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ArrowLeft, Download, X, HelpCircle, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseActores, parsePasos, TIPOS_PASO, TIPO_LABEL } from "@/lib/diagramas";
import { generarMermaid, idNodoParaPaso } from "@/lib/mermaid-render";
import {
  actualizarMetaAction,
  eliminarDiagramaAction,
  agregarActorAction,
  quitarActorAction,
  agregarPasoAction,
  actualizarPasoAction,
  quitarPasoAction,
  moverPasoArribaAction,
  moverPasoAbajoAction,
} from "@/app/(app)/actions";
import { EliminarDiagramaButton } from "./EliminarDiagramaButton";
import { DiagramaPreview } from "./DiagramaPreview";

/** "preguntas" llega en la URL solo justo después de generar un diagrama
 * con IA (ver generarDesdePromptAction) — no se persiste en la BD, es un
 * aviso de una sola vez. Si el parseo falla (link viejo, manipulado, etc.),
 * simplemente no se muestra nada — no es un error del usuario. */
function parsePreguntasPendientes(valor: string | undefined): string[] {
  if (!valor) return [];
  try {
    const r = z.array(z.string()).safeParse(JSON.parse(valor));
    return r.success ? r.data : [];
  } catch {
    return [];
  }
}

const LABEL = "block text-sm font-medium text-ink";
const INPUT =
  "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";

export default async function DiagramaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ editId?: string; preguntas?: string }>;
}) {
  const { id } = await params;
  const { editId, preguntas } = await searchParams;
  const user = await requireUser();

  const diagrama = await prisma.diagram.findFirst({
    where: { id, userId: user.id },
  });
  if (!diagrama) redirect("/dashboard");

  const actores = parseActores(diagrama.actores);
  const pasos = parsePasos(diagrama.pasos);
  const pasoEnEdicion = editId ? pasos.find((p) => p.id === editId) : undefined;
  const preguntasPendientes = parsePreguntasPendientes(preguntas);
  const codigoMermaid = generarMermaid(actores, pasos);

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

      {/* Aviso de la IA: esto no quedó claro, complétalo tú (solo aparece
          justo después de generar con IA, ver parsePreguntasPendientes) */}
      {preguntasPendientes.length > 0 && (
        <section className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-amber-800">
            <HelpCircle className="h-4 w-4" />
            Esto no quedó claro — complétalo tú
          </h2>
          <p className="mt-1 text-xs text-amber-800">
            La IA dejó estos puntos sin resolver en vez de inventarlos. Ajusta
            los pasos correspondientes en la tabla de abajo.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {preguntasPendientes.map((pregunta, i) => (
              <li key={i}>{pregunta}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Diagrama */}
      <section className="mt-6 rounded-xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-primary-ink">
            Diagrama
          </h2>
          {actores.length > 0 && pasos.length > 0 && (
            <a
              href={`/api/diagramas/${diagrama.id}/exportar`}
              title="Compatible con Bizagi, demo.bpmn.io, Camunda y otras herramientas BPMN 2.0 estándar"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-2 transition hover:bg-bg"
            >
              <Download className="h-4 w-4" />
              Descargar BPMN
            </a>
          )}
        </div>
        {actores.length > 0 && pasos.length > 0 && (
          <p className="mt-1.5 text-right text-xs text-ink-2">
            Compatible con Bizagi, demo.bpmn.io, Camunda y otras herramientas BPMN 2.0 estándar
          </p>
        )}
        <div className="mt-3">
          <DiagramaPreview
            codigo={codigoMermaid}
            resaltarNodoId={
              pasoEnEdicion ? idNodoParaPaso(pasos, pasoEnEdicion.id) : undefined
            }
          />
        </div>
      </section>

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
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Actor</th>
                  <th className="py-2 pr-2">Tipo</th>
                  <th className="py-2 pr-2">Texto</th>
                  <th className="py-2 pr-2">Destino</th>
                  <th className="py-2 pr-2"></th>
                </tr>
              </thead>
              <tbody>
                {pasos.map((p, idx) => (
                  <tr key={p.id} className="border-b border-line">
                    <td className="py-2 pr-2 text-ink-2">
                      <div className="flex items-center gap-1">
                        <span className="w-5 text-right tabular-nums">{idx + 1}</span>
                        <div className="flex flex-col">
                          <form action={moverPasoArribaAction}>
                            <input type="hidden" name="diagramId" value={diagrama.id} />
                            <input type="hidden" name="pasoId" value={p.id} />
                            <button
                              type="submit"
                              disabled={idx === 0}
                              title="Mover arriba"
                              className="cursor-pointer text-ink-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                          </form>
                          <form action={moverPasoAbajoAction}>
                            <input type="hidden" name="diagramId" value={diagrama.id} />
                            <input type="hidden" name="pasoId" value={p.id} />
                            <button
                              type="submit"
                              disabled={idx === pasos.length - 1}
                              title="Mover abajo"
                              className="cursor-pointer text-ink-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        </div>
                      </div>
                    </td>
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
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink-2 transition hover:bg-bg"
                      >
                        <Pencil className="h-3.5 w-3.5" />
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

        {/* Formulario agregar paso. Todos los campos de destino se muestran
            siempre (sin JS de cliente): el servidor descarta los que no
            aplican al tipo elegido (ver normalizarDestinos en actions.ts). */}
        <form
          action={agregarPasoAction}
          className="mt-5 space-y-3 rounded-lg border border-line bg-bg p-4"
        >
          <input type="hidden" name="diagramId" value={diagrama.id} />
          <p className="text-xs font-bold uppercase tracking-wide text-ink-2">
            Agregar paso
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={LABEL} htmlFor="actor">
                Actor
              </label>
              <select id="actor" name="actor" defaultValue={actores[0] ?? ""} className={INPUT}>
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
              <select id="tipo" name="tipo" defaultValue="tarea" className={INPUT}>
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
              <select id="siguiente" name="siguiente" defaultValue="" className={INPUT}>
                <option value="">— automático / sin destino —</option>
                {pasos.map((p) => (
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
              <select id="siguienteSi" name="siguienteSi" defaultValue="" className={INPUT}>
                <option value="">— elegir —</option>
                {pasos.map((p) => (
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
              <select id="siguienteNo" name="siguienteNo" defaultValue="" className={INPUT}>
                <option value="">— elegir —</option>
                {pasos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.texto || "(sin texto)"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            + Agregar paso
          </button>
        </form>
      </section>

      {/* Popup de edición de paso. Se abre navegando a ?editId=... (SSR, sin
          JS de cliente) — el overlay fixed evita que el formulario empuje el
          layout de la página, a diferencia del form inline de arriba. */}
      {pasoEnEdicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-line bg-surface p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-2">
                Editar paso
              </p>
              <Link
                href={`/diagramas/${diagrama.id}`}
                title="Cerrar"
                className="cursor-pointer rounded-full p-1 text-ink-2 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </Link>
            </div>

            <form action={actualizarPasoAction} className="mt-3 space-y-3">
              <input type="hidden" name="diagramId" value={diagrama.id} />
              <input type="hidden" name="pasoId" value={pasoEnEdicion.id} />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor="actor-edit">
                    Actor
                  </label>
                  <select
                    id="actor-edit"
                    name="actor"
                    defaultValue={pasoEnEdicion.actor}
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
                  <label className={LABEL} htmlFor="tipo-edit">
                    Tipo
                  </label>
                  <select
                    id="tipo-edit"
                    name="tipo"
                    defaultValue={pasoEnEdicion.tipo}
                    className={INPUT}
                  >
                    {TIPOS_PASO.map((t) => (
                      <option key={t} value={t}>
                        {TIPO_LABEL[t]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={LABEL} htmlFor="texto-edit">
                  Texto
                </label>
                <input
                  id="texto-edit"
                  name="texto"
                  defaultValue={pasoEnEdicion.texto}
                  placeholder="Ej. Verifica cantidades"
                  className={INPUT}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={LABEL} htmlFor="siguiente-edit">
                    Siguiente
                  </label>
                  <select
                    id="siguiente-edit"
                    name="siguiente"
                    defaultValue={pasoEnEdicion.siguiente ?? ""}
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
                  <label className={LABEL} htmlFor="siguienteSi-edit">
                    Sí →
                  </label>
                  <select
                    id="siguienteSi-edit"
                    name="siguienteSi"
                    defaultValue={pasoEnEdicion.siguienteSi ?? ""}
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
                  <label className={LABEL} htmlFor="siguienteNo-edit">
                    No →
                  </label>
                  <select
                    id="siguienteNo-edit"
                    name="siguienteNo"
                    defaultValue={pasoEnEdicion.siguienteNo ?? ""}
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
                  Guardar cambios
                </button>
                <Link
                  href={`/diagramas/${diagrama.id}`}
                  className="inline-flex items-center rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-bg"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
