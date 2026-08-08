"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, X, Sparkles, AlertTriangle } from "lucide-react";
import {
  guardarMacroprocesosAction,
  confirmarMapaValorAction,
  regenerarBorradorAction,
  volverABorradorAction,
  bajarANivel2Action,
  reemplazarYDetallarAction,
} from "@/app/(app)/valor-actions";
import {
  CATEGORIAS,
  ETIQUETAS_CATEGORIA,
  agruparPorCategoria,
  revisarMapaValor,
  type Alcance,
  type Categoria,
  type Macroproceso,
} from "@/lib/valor";

const INPUT =
  "w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink outline-none transition focus:border-primary";

let contadorIdLocal = 0;

/** ETIQUETAS_CATEGORIA es la ÚNICA fuente de texto visible para categoría —
 * la palabra "core" nunca se renderiza (§3.2 del diseño). */
function Columna({
  categoria,
  items,
  onEditar,
  onQuitar,
  onMover,
  onDetallar,
  detallando,
}: {
  categoria: Categoria;
  items: Macroproceso[];
  onEditar: (id: string, campo: "nombre" | "descripcion", valor: string) => void;
  onQuitar: (id: string) => void;
  onMover: (id: string, delta: 1 | -1) => void;
  onDetallar: (m: Macroproceso) => void;
  detallando: string | null;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-primary-ink">
        {ETIQUETAS_CATEGORIA[categoria]}
      </h3>
      <div className="mt-3 space-y-3">
        {items.length === 0 && (
          <p className="text-xs text-ink-2">Sin macroprocesos en esta categoría.</p>
        )}
        {items.map((m, idx) => (
          <div key={m.id} className="rounded-lg border border-line bg-bg p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => onMover(m.id, -1)}
                  title="Mover arriba"
                  className="cursor-pointer text-ink-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === items.length - 1}
                  onClick={() => onMover(m.id, 1)}
                  title="Mover abajo"
                  className="cursor-pointer text-ink-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  className={`${INPUT} font-medium`}
                  value={m.nombre}
                  onChange={(e) => onEditar(m.id, "nombre", e.target.value)}
                  maxLength={60}
                />
                <textarea
                  className={INPUT}
                  rows={2}
                  value={m.descripcion}
                  onChange={(e) => onEditar(m.id, "descripcion", e.target.value)}
                  maxLength={200}
                />
              </div>
              <button
                type="button"
                onClick={() => onQuitar(m.id)}
                title="Quitar"
                className="cursor-pointer rounded-full p-0.5 text-ink-2 hover:text-danger"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              {m.propuestoPorIa ? (
                <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-ink">
                  <Sparkles className="h-3 w-3" />
                  IA
                </span>
              ) : (
                <span />
              )}
              {m.diagramId ? (
                <span className="text-xs font-medium text-ink-2">Ya detallado</span>
              ) : (
                <button
                  type="button"
                  disabled={detallando === m.id}
                  onClick={() => onDetallar(m)}
                  className="cursor-pointer rounded-lg border border-primary px-2.5 py-1 text-xs font-semibold text-primary-ink transition hover:bg-bg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {detallando === m.id ? "Creando…" : "Detallar este proceso"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapaValorEditor({
  valueMapId,
  macroprocesosIniciales,
  alcance,
  confirmado,
}: {
  valueMapId: string;
  macroprocesosIniciales: Macroproceso[];
  alcance: Alcance;
  confirmado: boolean;
}) {
  const router = useRouter();
  const [macroprocesos, setMacroprocesos] = useState(macroprocesosIniciales);
  const [confirmadoLocal, setConfirmadoLocal] = useState(confirmado);
  const [detallando, setDetallando] = useState<string | null>(null);
  const [reemplazando, setReemplazando] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<{
    macroproceso: Macroproceso;
    mensaje: string;
    cupoOcupado?: boolean;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const avisos = useMemo(() => revisarMapaValor(macroprocesos, alcance), [macroprocesos, alcance]);
  const porCategoria = useMemo(() => agruparPorCategoria(macroprocesos), [macroprocesos]);

  function editarCampo(id: string, campo: "nombre" | "descripcion", valor: string) {
    setMacroprocesos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [campo]: valor, propuestoPorIa: false } : m)),
    );
  }

  function quitar(id: string) {
    setMacroprocesos((prev) => prev.filter((m) => m.id !== id));
  }

  function mover(id: string, delta: 1 | -1) {
    setMacroprocesos((prev) => {
      const categoria = prev.find((m) => m.id === id)?.categoria;
      if (!categoria) return prev;
      // Reordena solo dentro del grupo de la misma categoría, preservando
      // el resto del array — el orden es dato real (§3.4 del diseño), así
      // que se mueve el elemento manteniendo su posición relativa al resto
      // de su propia categoría, sin tocar las otras.
      const idsGrupo = prev.filter((m) => m.categoria === categoria).map((m) => m.id);
      const idx = idsGrupo.indexOf(id);
      const destino = idx + delta;
      if (destino < 0 || destino >= idsGrupo.length) return prev;
      [idsGrupo[idx], idsGrupo[destino]] = [idsGrupo[destino], idsGrupo[idx]];

      const cola = [...idsGrupo];
      return prev.map((m) => (m.categoria === categoria ? prev.find((x) => x.id === cola.shift())! : m));
    });
  }

  function agregar(categoria: Categoria) {
    contadorIdLocal += 1;
    const nuevo: Macroproceso = {
      id: `local-${Date.now()}-${contadorIdLocal}`,
      nombre: "Nuevo macroproceso",
      categoria,
      descripcion: "",
      propuestoPorIa: false,
    };
    setMacroprocesos((prev) => [...prev, nuevo]);
  }

  function guardar() {
    const form = new FormData();
    form.set("valueMapId", valueMapId);
    form.set("macroprocesosJson", JSON.stringify(macroprocesos));
    startTransition(async () => {
      await guardarMacroprocesosAction(form);
      router.refresh();
    });
  }

  function confirmar() {
    const form = new FormData();
    form.set("valueMapId", valueMapId);
    startTransition(async () => {
      await confirmarMapaValorAction(form);
      setConfirmadoLocal(true);
      router.refresh();
    });
  }

  function detallar(m: Macroproceso) {
    setErrorDetalle(null);
    setDetallando(m.id);
    startTransition(async () => {
      const resultado = await bajarANivel2Action(valueMapId, m.id);
      setDetallando(null);
      if ("error" in resultado) {
        setErrorDetalle({ macroproceso: m, mensaje: resultado.error, cupoOcupado: resultado.cupoOcupado });
        return;
      }
      router.push(`/diagramas/${resultado.diagramId}`);
    });
  }

  function reemplazar(m: Macroproceso) {
    setReemplazando(true);
    startTransition(async () => {
      const resultado = await reemplazarYDetallarAction(valueMapId, m.id);
      setReemplazando(false);
      if ("error" in resultado) {
        setErrorDetalle({ macroproceso: m, mensaje: resultado.error, cupoOcupado: resultado.cupoOcupado });
        return;
      }
      router.push(`/diagramas/${resultado.diagramId}`);
    });
  }

  return (
    <div className="mt-6">
      {/* Franja de aviso superior — badge "propuesta editable" es un `if`
          sobre confirmado, no una frase del prompt (§3.2 del diseño). */}
      {!confirmadoLocal && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold uppercase tracking-wide text-amber-800">
            Borrador — plantilla del rubro, editala
          </p>
          <p className="mt-1">
            Esto es una estructura típica de tu rubro, no el mapa real de tu
            empresa todavía. Ajustá nombres, agregá o quitá lo que
            corresponda, y confirmá cuando refleje tu negocio.
          </p>
        </div>
      )}

      {avisos.length > 0 && (
        <div className="mt-4 rounded-xl border border-line bg-surface p-4">
          <h3 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-primary-ink">
            <AlertTriangle className="h-4 w-4" />
            Para revisar
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-2">
            {avisos.map((a, i) => (
              <li key={i}>{a.mensaje}</li>
            ))}
          </ul>
        </div>
      )}

      {errorDetalle && (
        <div className="mt-4 rounded-xl border border-danger/40 bg-danger/5 p-4 text-sm">
          <p className="text-danger">{errorDetalle.mensaje}</p>
          <div className="mt-2 flex gap-2">
            {errorDetalle.cupoOcupado && (
              <button
                type="button"
                disabled={reemplazando}
                onClick={() => reemplazar(errorDetalle.macroproceso)}
                className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reemplazando ? "Reemplazando…" : "Reemplazar"}
              </button>
            )}
            <a
              href="/suscripcion"
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:bg-bg"
            >
              Suscribirme
            </a>
            <button
              type="button"
              onClick={() => setErrorDetalle(null)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:bg-bg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {CATEGORIAS.map((categoria) => (
          <div key={categoria} className="space-y-2">
            <Columna
              categoria={categoria}
              items={porCategoria[categoria]}
              onEditar={editarCampo}
              onQuitar={quitar}
              onMover={mover}
              onDetallar={detallar}
              detallando={detallando}
            />
            <button
              type="button"
              onClick={() => agregar(categoria)}
              className="w-full cursor-pointer rounded-lg border border-dashed border-line px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:bg-bg"
            >
              + Agregar a {ETIQUETAS_CATEGORIA[categoria]}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={guardar}
          className="cursor-pointer rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-bg disabled:opacity-60"
        >
          Guardar cambios
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={confirmar}
          className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          Confirmar mapa de tu empresa
        </button>
        <form action={regenerarBorradorAction}>
          <input type="hidden" name="valueMapId" value={valueMapId} />
          <button
            type="submit"
            className="cursor-pointer rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-bg"
          >
            Regenerar borrador
          </button>
        </form>
        <form action={volverABorradorAction}>
          <input type="hidden" name="valueMapId" value={valueMapId} />
          <button
            type="submit"
            className="cursor-pointer rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-bg"
          >
            Volver al borrador original
          </button>
        </form>
      </div>
    </div>
  );
}
