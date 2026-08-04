"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { crearDiagramaAction, type FormState } from "@/app/(app)/actions";

const estadoInicial: FormState = {};

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

export function NuevoDiagramaForm() {
  const [state, formAction, pending] = useActionState(
    crearDiagramaAction,
    estadoInicial,
  );
  const e = state.errors ?? {};
  const borde = (campo: string) =>
    `${INPUT} ${e[campo] ? "border-danger" : "border-line"}`;

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

      <button
        type="submit"
        disabled={pending}
        className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear diagrama"}
      </button>
    </form>
  );
}
