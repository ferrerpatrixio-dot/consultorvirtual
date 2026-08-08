"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
import type { ProcedimientoContenido } from "@/lib/procedimientos";
import {
  confirmarProcedimientoAction,
  generarProcedimientoAction,
  guardarProcedimientoManualAction,
  type EstadoGeneracionProcedimiento,
} from "@/app/(app)/actions";

// Nivel 4 de F02 — panel lateral de procedimiento (docs/DISENO-NIVELES-1-4-F02.md
// §6.2, PARTE B). Drawer, no pantalla separada: el usuario necesita ver el
// contexto del paso (actor, texto, vecinos) mientras describe cómo se hace.
//
// Generación de DOS TIEMPOS, regla dura: el usuario escribe libre cómo se
// hace el paso (textarea); el LLM ESTRUCTURA ese texto, nunca inventa
// contenido nuevo (generarProcedimientoAction en actions.ts). Lo editado acá
// después de generar es edición manual del usuario, no una segunda pasada
// de IA.

const LABEL = "block text-xs font-medium text-ink-2";
const INPUT =
  "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-primary";

// Checklist socrático (§6.2 "recomendación del analista"): NO son campos
// obligatorios, son ayuda visual para que el usuario no escriba una sola
// línea pobre. Puramente informativo, no se envía a ningún lado.
const PREGUNTAS_GUIA = [
  "¿Con qué herramienta o sistema se hace?",
  "¿Qué dato necesitás a mano antes de empezar?",
  "¿A quién le llega el resultado?",
  "¿En qué plazo tiene que estar hecho?",
  "¿Qué hacés si algo falla o no cuadra?",
];

type ContextoPasoUI = {
  id: string;
  actor: string;
  texto: string;
  anterior?: string;
  siguiente?: string;
};

type Instruccion = { orden: number; accion: string; herramienta?: string };

function contenidoVacio(): ProcedimientoContenido {
  return {
    objetivo: "",
    precondiciones: [],
    instrucciones: [{ orden: 1, accion: "" }],
    resultadoEsperado: "",
    excepciones: [],
    faltantes: [],
  };
}

/** Editor de una lista de strings simple (precondiciones / faltantes),
 * agregar/quitar sin numeración — a diferencia de instrucciones, el orden
 * acá no es dato significativo. */
function ListaSimple({
  titulo,
  placeholder,
  items,
  onChange,
}: {
  titulo: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <p className={LABEL}>{titulo}</p>
      <div className="mt-1 space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-1.5">
            <input
              value={item}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className={`${INPUT} mt-0`}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="cursor-pointer rounded-lg p-2 text-ink-2 hover:text-danger"
              title="Quitar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-1.5 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary-ink hover:underline"
      >
        <Plus className="h-3.5 w-3.5" />
        Agregar
      </button>
    </div>
  );
}

/** Editor de instrucciones numeradas, reordenables — mismo patrón visual
 * (número + flechas arriba/abajo) que la tabla de pasos del diagrama, pero
 * client-side: es una lista dentro de un único campo Json, no filas
 * independientes con su propia Server Action de reordenar. */
function EditorInstrucciones({
  instrucciones,
  onChange,
}: {
  instrucciones: Instruccion[];
  onChange: (items: Instruccion[]) => void;
}) {
  function renumerar(items: Instruccion[]): Instruccion[] {
    return items.map((it, i) => ({ ...it, orden: i + 1 }));
  }
  function mover(idx: number, delta: 1 | -1) {
    const destino = idx + delta;
    if (destino < 0 || destino >= instrucciones.length) return;
    const next = [...instrucciones];
    [next[idx], next[destino]] = [next[destino], next[idx]];
    onChange(renumerar(next));
  }

  return (
    <div>
      <p className={LABEL}>Instrucciones (en orden)</p>
      <div className="mt-1 space-y-2">
        {instrucciones.map((instr, i) => (
          <div key={i} className="flex gap-2 rounded-lg border border-line bg-bg p-2">
            <div className="flex flex-col items-center pt-1">
              <span className="w-5 text-center text-xs tabular-nums text-ink-2">{i + 1}</span>
              <button
                type="button"
                disabled={i === 0}
                onClick={() => mover(i, -1)}
                className="cursor-pointer text-ink-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                title="Mover arriba"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={i === instrucciones.length - 1}
                onClick={() => mover(i, 1)}
                className="cursor-pointer text-ink-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                title="Mover abajo"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 space-y-1.5">
              <input
                value={instr.accion}
                placeholder="Ej. Abrí el módulo de cotizaciones"
                onChange={(e) => {
                  const next = [...instrucciones];
                  next[i] = { ...next[i], accion: e.target.value };
                  onChange(next);
                }}
                className={`${INPUT} mt-0`}
              />
              <input
                value={instr.herramienta ?? ""}
                placeholder="Herramienta (opcional): sistema, planilla, formulario"
                onChange={(e) => {
                  const next = [...instrucciones];
                  next[i] = { ...next[i], herramienta: e.target.value || undefined };
                  onChange(next);
                }}
                className={`${INPUT} mt-0 text-xs`}
              />
            </div>
            <button
              type="button"
              onClick={() => onChange(renumerar(instrucciones.filter((_, idx) => idx !== i)))}
              className="cursor-pointer self-start p-1 text-ink-2 hover:text-danger"
              title="Quitar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...instrucciones, { orden: instrucciones.length + 1, accion: "" }])}
        className="mt-1.5 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary-ink hover:underline"
      >
        <Plus className="h-3.5 w-3.5" />
        Agregar instrucción
      </button>
    </div>
  );
}

export function ProcedimientoDrawer({
  diagramId,
  paso,
  contenidoInicial,
  estadoInicial,
  promptFuenteInicial,
  siguientePasoSinDocumentarId,
  cobertura,
}: {
  diagramId: string;
  paso: ContextoPasoUI;
  contenidoInicial: ProcedimientoContenido | null;
  estadoInicial: "borrador" | "confirmado" | null;
  promptFuenteInicial: string;
  /** Próximo pasoId de `cobertura.faltantes` distinto del actual — permite
   * saltar directo al siguiente paso sin procedimiento sin volver a la
   * tabla (pedido DISEÑADOR-UX, VB condicional). Ya viene resuelto por
   * page.tsx sobre el `cobertura.faltantes` que ya calculaba (línea ~126),
   * el drawer no recalcula nada. */
  siguientePasoSinDocumentarId?: string;
  /** Contador de cobertura ("3 de 12 documentados"), mismo dato que ya vive
   * en la tabla — visible acá porque el drawer la tapa mientras está
   * abierto. */
  cobertura?: { conProcedimiento: number; elegibles: number };
}) {
  const initialState: EstadoGeneracionProcedimiento = {};
  const [genState, generarAction, generando] = useActionState(generarProcedimientoAction, initialState);
  const [promptUsuario, setPromptUsuario] = useState(promptFuenteInicial);
  const [contenido, setContenido] = useState<ProcedimientoContenido>(contenidoInicial ?? contenidoVacio());
  const [estado, setEstado] = useState(estadoInicial);
  const tieneContenido = contenidoInicial !== null || contenido.objetivo.trim() !== "";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-line bg-surface p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-2">Procedimiento del paso</p>
            <p className="mt-0.5 text-sm text-ink">
              {paso.texto || "(sin texto)"}{" "}
              <span className="text-ink-2">— {paso.actor || "sin actor"}</span>
            </p>
            {cobertura && cobertura.elegibles > 0 && (
              <p className="mt-0.5 text-xs text-ink-2">
                {cobertura.conProcedimiento} de {cobertura.elegibles} documentados
              </p>
            )}
          </div>
          <Link
            href={`/diagramas/${diagramId}`}
            title="Cerrar"
            className="cursor-pointer rounded-full p-1 text-ink-2 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>

        {(paso.anterior || paso.siguiente) && (
          <p className="mt-2 text-xs text-ink-2">
            {paso.anterior && <>Antes: «{paso.anterior}». </>}
            {paso.siguiente && <>Después: «{paso.siguiente}».</>}
          </p>
        )}

        {/* Paso 1 — texto libre del usuario, con checklist socrático de
            apoyo visual (§6.2: "no son campos obligatorios, son ayuda"). */}
        <section className="mt-4 rounded-xl border border-line bg-bg p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-2">
            Contale al sistema cómo se hace este paso
          </p>
          <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-ink-2">
            {PREGUNTAS_GUIA.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <form action={generarAction} className="mt-3">
            <input type="hidden" name="diagramId" value={diagramId} />
            <input type="hidden" name="pasoId" value={paso.id} />
            <textarea
              name="promptUsuario"
              value={promptUsuario}
              onChange={(e) => setPromptUsuario(e.target.value)}
              rows={4}
              placeholder="Ej. El vendedor abre el sistema de cotizaciones, busca el repuesto por código, aplica el margen estándar del 20% y le manda la cotización por WhatsApp al cliente. Si no tiene el repuesto en stock, avisa a Bodega."
              className={`${INPUT} mt-0`}
            />
            {genState.error && <p className="mt-1.5 text-xs text-danger">{genState.error}</p>}
            <button
              type="submit"
              disabled={generando}
              className="mt-2 cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generando
                ? "Generando…"
                : tieneContenido
                  ? "Regenerar con IA"
                  : "Estructurar con IA"}
            </button>
            <p className="mt-1.5 text-xs text-ink-2">
              La IA solo ordena lo que escribiste. Lo que no dijiste queda como pregunta abierta, nunca lo inventa.
            </p>
          </form>
        </section>

        {/* Paso 2 — contenido estructurado, editable a mano. Se muestra en
            cuanto hay contenido (generado o ya guardado antes). */}
        {tieneContenido && (
          <form
            action={guardarProcedimientoManualAction}
            className="mt-4 space-y-4 rounded-xl border border-line bg-surface p-4"
          >
            <input type="hidden" name="diagramId" value={diagramId} />
            <input type="hidden" name="pasoId" value={paso.id} />
            <input type="hidden" name="contenidoJson" value={JSON.stringify(contenido)} />

            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-2">Procedimiento</p>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  estado === "confirmado" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {estado === "confirmado" ? "Confirmado" : "Borrador"}
              </span>
            </div>

            <div>
              <label className={LABEL}>Objetivo</label>
              <input
                value={contenido.objetivo}
                onChange={(e) => setContenido({ ...contenido, objetivo: e.target.value })}
                className={INPUT}
              />
            </div>

            <ListaSimple
              titulo="Precondiciones (qué tiene que estar listo antes)"
              placeholder="Ej. Cliente identificado en el sistema"
              items={contenido.precondiciones}
              onChange={(items) => setContenido({ ...contenido, precondiciones: items })}
            />

            <EditorInstrucciones
              instrucciones={contenido.instrucciones}
              onChange={(items) => setContenido({ ...contenido, instrucciones: items })}
            />

            <div>
              <label className={LABEL}>Resultado esperado</label>
              <input
                value={contenido.resultadoEsperado}
                onChange={(e) => setContenido({ ...contenido, resultadoEsperado: e.target.value })}
                className={INPUT}
              />
            </div>

            <div>
              <p className={LABEL}>Excepciones</p>
              <div className="mt-1 space-y-1.5">
                {contenido.excepciones.map((exc, i) => (
                  <div key={i} className="flex gap-1.5">
                    <input
                      value={exc.situacion}
                      placeholder="Si pasa esto…"
                      onChange={(e) => {
                        const next = [...contenido.excepciones];
                        next[i] = { ...next[i], situacion: e.target.value };
                        setContenido({ ...contenido, excepciones: next });
                      }}
                      className={`${INPUT} mt-0`}
                    />
                    <input
                      value={exc.queHacer}
                      placeholder="…hacé esto"
                      onChange={(e) => {
                        const next = [...contenido.excepciones];
                        next[i] = { ...next[i], queHacer: e.target.value };
                        setContenido({ ...contenido, excepciones: next });
                      }}
                      className={`${INPUT} mt-0`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setContenido({
                          ...contenido,
                          excepciones: contenido.excepciones.filter((_, idx) => idx !== i),
                        })
                      }
                      className="cursor-pointer rounded-lg p-2 text-ink-2 hover:text-danger"
                      title="Quitar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setContenido({
                    ...contenido,
                    excepciones: [...contenido.excepciones, { situacion: "", queHacer: "" }],
                  })
                }
                className="mt-1.5 inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary-ink hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar excepción
              </button>
            </div>

            {contenido.faltantes.length > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Preguntas abiertas — la IA no las completó
                </p>
                <ListaSimple
                  titulo=""
                  placeholder="Pregunta pendiente"
                  items={contenido.faltantes}
                  onChange={(items) => setContenido({ ...contenido, faltantes: items })}
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="cursor-pointer rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-2 transition hover:bg-bg"
              >
                Guardar edición
              </button>
            </div>
          </form>
        )}

        {tieneContenido && estado !== "confirmado" && (
          <form
            action={async (fd) => {
              await confirmarProcedimientoAction(fd);
              setEstado("confirmado");
            }}
            className="mt-3"
          >
            <input type="hidden" name="diagramId" value={diagramId} />
            <input type="hidden" name="pasoId" value={paso.id} />
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Confirmar procedimiento
            </button>
          </form>
        )}

        {/* Salto directo al próximo paso sin procedimiento (VB condicional
            DISEÑADOR-UX): evita volver a la tabla a cazar la fila siguiente
            en procesos largos. `siguientePasoSinDocumentarId` ya excluye el
            paso actual (lo resuelve page.tsx sobre cobertura.faltantes). */}
        {siguientePasoSinDocumentarId ? (
          <Link
            href={`/diagramas/${diagramId}?procId=${siguientePasoSinDocumentarId}`}
            className="mt-2 inline-flex cursor-pointer items-center text-sm font-medium text-primary-ink hover:underline"
          >
            Siguiente paso sin documentar →
          </Link>
        ) : (
          <p className="mt-2 text-sm text-ink-2">Listo, no quedan pasos sin documentar.</p>
        )}
      </div>
    </div>
  );
}
