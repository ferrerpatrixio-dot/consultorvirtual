"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, HelpCircle } from "lucide-react";
import {
  generarDesdePromptAction,
  confirmarDiagramaGeneradoAction,
} from "@/app/(app)/actions";
import type { FormState } from "@/app/(app)/actions";
import { TIPO_LABEL } from "@/lib/diagramas";

const estadoInicial: FormState = {};
const PROMPT_MAX = 4000;
const PROMPT_UMBRAL_AMBAR = 3600;

const LABEL = "block text-sm font-medium text-ink";
const INPUT =
  "mt-1 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";

function CampoError({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      {mensaje}
    </p>
  );
}

const ESTILO_SEVERIDAD: Record<string, string> = {
  bloqueante: "bg-danger/10 text-danger",
  pendiente: "bg-amber-100 text-amber-800",
  sugerencia: "bg-bg text-ink-2",
};

export function NuevoDiagramaIAForm() {
  const [genState, genAction, genPending] = useActionState(
    generarDesdePromptAction,
    estadoInicial,
  );
  const [confirmState, confirmAction, confirmPending] = useActionState(
    confirmarDiagramaGeneradoAction,
    estadoInicial,
  );
  const [promptLength, setPromptLength] = useState(0);

  // La revisión más reciente: si el usuario ya intentó confirmar (y falló
  // por un bloqueante), confirmState.revision manda; si no, la que dejó la
  // generación inicial.
  const revision = confirmState.revision ?? genState.revision;
  const erroresConfirmacion = confirmState.errors ?? {};

  // ── Fase 1: describir el proceso ──────────────────────────────────────
  if (!revision) {
    const e = genState.errors ?? {};
    const borde = (campo: string) =>
      `${INPUT} ${e[campo] ? "border-danger" : "border-line"}`;

    return (
      <form action={genAction} className="mt-6 space-y-4">
        <div>
          <label className={LABEL} htmlFor="cliente">
            Cliente
          </label>
          <input
            id="cliente"
            name="cliente"
            placeholder="Ej. SSTT Ernesto Andino"
            className={borde("cliente")}
            aria-invalid={!!e.cliente}
          />
          <CampoError mensaje={e.cliente} />
        </div>

        <div>
          <label className={LABEL} htmlFor="proceso">
            Proceso levantado
          </label>
          <input
            id="proceso"
            name="proceso"
            placeholder="Ej. Recepción y validación de equipos"
            className={borde("proceso")}
            aria-invalid={!!e.proceso}
          />
          <CampoError mensaje={e.proceso} />
        </div>

        <div>
          <label className={LABEL} htmlFor="prompt">
            Describe el proceso
          </label>
          <textarea
            id="prompt"
            name="prompt"
            rows={8}
            maxLength={PROMPT_MAX}
            placeholder="Ej. El distribuidor llega con el camión y presenta la documentación al guardián. El guardián registra la entrada y revisa que la documentación esté válida; si no lo está, rechaza la entrega. Si está válida, el bodeguero traslada las cajas..."
            className={borde("prompt")}
            aria-invalid={!!e.prompt}
            onChange={(ev) => setPromptLength(ev.target.value.length)}
          />
          <CampoError mensaje={e.prompt} />
          <p className="mt-1.5 text-xs text-ink-2">
            La IA puede interpretar mal algo ambiguo — antes de crear el
            diagrama vas a poder revisar la lista de pasos detectados.
          </p>
          <p
            className={`mt-1 text-right text-xs ${
              promptLength >= PROMPT_UMBRAL_AMBAR ? "text-amber-600" : "text-ink-2"
            }`}
          >
            {promptLength} / {PROMPT_MAX}
          </p>
        </div>

        <button
          type="submit"
          disabled={genPending}
          className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {genPending ? "Generando lista revisable…" : "Generar lista revisable"}
        </button>
      </form>
    );
  }

  // ── Fase 2: lista revisable — nada se guardó todavía ──────────────────
  const hayBloqueantes = revision.huecos.some((h) => h.severidad === "bloqueante");

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-ink-2">
        Esto es lo que la IA entendió. Nada se ha guardado todavía — revisa,
        y si hay algo bloqueante corrígelo describiendo el proceso de nuevo
        antes de confirmar.
      </p>

      {revision.pendingQuestions.length > 0 && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-amber-800">
            <HelpCircle className="h-4 w-4" />
            Esto no quedó claro
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {revision.pendingQuestions.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>
      )}

      {revision.huecos.length > 0 && (
        <section className="rounded-xl border border-line bg-surface p-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-primary-ink">
            Qué falta definir
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {revision.huecos.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    ESTILO_SEVERIDAD[h.severidad] ?? ESTILO_SEVERIDAD.sugerencia
                  }`}
                >
                  {h.severidad}
                </span>
                <span className="text-ink-2">{h.mensaje}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-line bg-surface p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-primary-ink">
          Pasos detectados
        </h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-2">
                <th className="py-1.5 pr-2">#</th>
                <th className="py-1.5 pr-2">Actor</th>
                <th className="py-1.5 pr-2">Tipo</th>
                <th className="py-1.5 pr-2">Texto</th>
              </tr>
            </thead>
            <tbody>
              {revision.pasos.map((p, idx) => (
                <tr key={p.id} className="border-b border-line">
                  <td className="py-1.5 pr-2 text-ink-2">{idx + 1}</td>
                  <td className="py-1.5 pr-2">{p.actor || "—"}</td>
                  <td className="py-1.5 pr-2">{TIPO_LABEL[p.tipo]}</td>
                  <td className="py-1.5 pr-2">{p.texto || "(sin texto)"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <form action={confirmAction} className="space-y-3">
        <input type="hidden" name="cliente" value={revision.cliente} />
        <input type="hidden" name="proceso" value={revision.proceso} />
        <input type="hidden" name="actoresJson" value={JSON.stringify(revision.actores)} />
        <input type="hidden" name="pasosJson" value={JSON.stringify(revision.pasos)} />
        <input
          type="hidden"
          name="pendingQuestionsJson"
          value={JSON.stringify(revision.pendingQuestions)}
        />

        <CampoError mensaje={erroresConfirmacion.prompt} />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={confirmPending || hayBloqueantes}
            title={hayBloqueantes ? "Resuelve los puntos bloqueantes antes de continuar" : undefined}
            className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmPending ? "Creando diagrama…" : "Confirmar y crear diagrama"}
          </button>
          <Link
            href="/diagramas/nuevo-ia"
            className="inline-flex items-center rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink-2 transition hover:bg-bg"
          >
            Describir de nuevo
          </Link>
        </div>
      </form>
    </div>
  );
}
