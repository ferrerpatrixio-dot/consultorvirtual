"use client";

import { useActionState, useState } from "react";
import { AlertCircle } from "lucide-react";
import { generarDesdePromptAction } from "@/app/(app)/actions";
import type { FormState } from "@/app/(app)/actions";

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

export function NuevoDiagramaIAForm() {
  const [state, formAction, pending] = useActionState(
    generarDesdePromptAction,
    estadoInicial,
  );
  const e = state.errors ?? {};
  const borde = (campo: string) =>
    `${INPUT} ${e[campo] ? "border-danger" : "border-line"}`;
  const [promptLength, setPromptLength] = useState(0);

  return (
    <form action={formAction} className="mt-6 space-y-4">
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
          La IA puede interpretar mal algo ambiguo — después de generar el
          diagrama vas a poder revisarlo y corregirlo con el editor.
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
        disabled={pending}
        className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Generando diagrama…" : "Generar diagrama con IA"}
      </button>
    </form>
  );
}
