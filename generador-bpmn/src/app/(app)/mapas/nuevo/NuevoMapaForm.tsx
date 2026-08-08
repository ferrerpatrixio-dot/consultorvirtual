"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { crearMapaValorAction, type ValorFormState } from "@/app/(app)/valor-actions";
import type { Alcance } from "@/lib/valor";

const estadoInicial: ValorFormState = {};

const LABEL = "block text-sm font-medium text-ink";
const INPUT =
  "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";

export function NuevoMapaForm({
  alcances,
  etiquetas,
}: {
  alcances: readonly Alcance[];
  etiquetas: Record<Alcance, string>;
}) {
  const [state, action, pending] = useActionState(crearMapaValorAction, estadoInicial);

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className={LABEL} htmlFor="cliente">
          Cliente
        </label>
        <input
          id="cliente"
          name="cliente"
          placeholder="Ej. SSTT Ernesto Andino"
          className={INPUT}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="rubro">
          Rubro de la empresa
        </label>
        <input
          id="rubro"
          name="rubro"
          placeholder="Ej. Taller mecánico automotriz"
          className={INPUT}
        />
        <p className="mt-1.5 text-xs text-ink-2">
          Es el único insumo del borrador — con esto alcanza para un patrón
          de industria.
        </p>
      </div>

      <div>
        <label className={LABEL} htmlFor="alcance">
          Alcance del mapa
        </label>
        <select id="alcance" name="alcance" defaultValue="empresa" className={INPUT}>
          {alcances.map((a) => (
            <option key={a} value={a}>
              {etiquetas[a]}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-ink-2">
          Si mapeas solo una unidad o una sede, no te vamos a exigir balance
          de cadena de valor completa.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Generando borrador…" : "Generar borrador"}
      </button>
    </form>
  );
}
