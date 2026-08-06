import type { Paso, TipoPaso } from "@/lib/diagramas";

// Port casi literal de generarMermaid() del prototipo
// (apps/generador-diagramas.html, líneas 381-424): mismo algoritmo
// (subgraph por actor, forma de nodo por tipo, classDef 60-30-10), mismo
// motor de render (Mermaid). Ver docs/PROPUESTA-ARQUITECTO-BPMN-DESDE-PROMPT.md
// sección 4.
//
// Única desviación real del prototipo: los ids de "pasos" en este producto
// pueden ser un UUID (crypto.randomUUID(), ver agregarPasoAction en
// (app)/actions.ts) en vez de los "n1", "n2"... secuenciales del prototipo.
// Un UUID con guiones no es un id de nodo válido en la sintaxis de Mermaid,
// así que acá se mapea cada paso.id a un id de nodo seguro (alfanumérico)
// antes de escribir el código Mermaid — el prototipo no necesitaba esto
// porque nunca generaba ids con guiones.

const ICONOS: Record<TipoPaso, string> = {
  inicio: "▶",
  tarea: "",
  sistema: "⚙️",
  decision: "",
  fin_ok: "✓",
  fin_error: "✗",
};

function slugify(actor: string): string {
  return (
    "lane_" +
    actor
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
  );
}

function formaNodo(nodoId: string, p: Paso): string {
  const texto = (p.texto || "(sin texto)").replace(/"/g, "'");
  const icono = ICONOS[p.tipo];
  const conIcono = icono ? `${icono} ${texto}` : texto;
  if (p.tipo === "inicio" || p.tipo === "fin_ok" || p.tipo === "fin_error") {
    return `${nodoId}(["${conIcono}"])`;
  }
  if (p.tipo === "decision") {
    return `${nodoId}{"${conIcono}"}`;
  }
  return `${nodoId}["${conIcono}"]`;
}

/**
 * Id de nodo Mermaid ("n0", "n1"...) que le corresponde a un paso, según la
 * misma regla que usa generarMermaid (posición en el array). Se usa para
 * resaltar en el preview el nodo del paso que se está editando.
 */
export function idNodoParaPaso(pasos: Paso[], pasoId: string): string | undefined {
  const idx = pasos.findIndex((p) => p.id === pasoId);
  return idx === -1 ? undefined : `n${idx}`;
}

/**
 * Genera el código Mermaid (flowchart TD) a partir de actores + pasos.
 * Devuelve null si no hay suficiente data para dibujar nada, igual que el
 * prototipo original.
 */
export function generarMermaid(actores: string[], pasos: Paso[]): string | null {
  if (pasos.length === 0 || actores.length === 0) return null;

  // Mapa paso.id -> id de nodo seguro para Mermaid (ver nota arriba).
  const nodoIdPorPaso = new Map<string, string>();
  pasos.forEach((p, idx) => nodoIdPorPaso.set(p.id, `n${idx}`));
  const nodoId = (pasoId: string) => nodoIdPorPaso.get(pasoId);

  const lineas: string[] = ["flowchart TD"];

  // Carriles por actor
  actores.forEach((actor) => {
    const pasosDelActor = pasos.filter((p) => p.actor === actor);
    if (pasosDelActor.length === 0) return;
    lineas.push(`  subgraph ${slugify(actor)}["👤 ${actor.replace(/"/g, "'")}"]`);
    pasosDelActor.forEach((p) => lineas.push(`    ${formaNodo(nodoId(p.id)!, p)}`));
    lineas.push("  end");
  });

  // Conexiones
  pasos.forEach((p, idx) => {
    const origen = nodoId(p.id)!;
    if (p.tipo === "decision") {
      if (p.siguienteSi && nodoId(p.siguienteSi)) {
        lineas.push(`  ${origen} -->|"Sí"| ${nodoId(p.siguienteSi)}`);
      }
      if (p.siguienteNo && nodoId(p.siguienteNo)) {
        lineas.push(`  ${origen} -->|"No"| ${nodoId(p.siguienteNo)}`);
      }
    } else if (p.tipo === "fin_ok" || p.tipo === "fin_error") {
      // sin salida
    } else {
      const destinoPasoId = p.siguiente || (pasos[idx + 1] ? pasos[idx + 1].id : "");
      const destino = destinoPasoId ? nodoId(destinoPasoId) : undefined;
      if (destino) lineas.push(`  ${origen} --> ${destino}`);
    }
  });

  // Estilos (mismo estándar 60-30-10 ya aprobado en el kit)
  lineas.push("  classDef inicio fill:#28a745,stroke:#333,stroke-width:3px,color:#fff");
  lineas.push("  classDef tarea fill:#007bff,stroke:#333,stroke-width:2px,color:#fff");
  lineas.push("  classDef sistema fill:#f8f9fa,stroke:#333,stroke-width:2px,color:#333");
  lineas.push("  classDef decision fill:#ffc107,stroke:#333,stroke-width:2px,color:#333");
  lineas.push("  classDef finOk fill:#28a745,stroke:#333,stroke-width:3px,color:#fff");
  lineas.push("  classDef finError fill:#dc3545,stroke:#333,stroke-width:3px,color:#fff");

  (["inicio", "tarea", "sistema", "decision", "fin_ok", "fin_error"] as const).forEach((tipo) => {
    const ids = pasos.filter((p) => p.tipo === tipo).map((p) => nodoId(p.id)!);
    if (!ids.length) return;
    const claseCss = tipo === "fin_ok" ? "finOk" : tipo === "fin_error" ? "finError" : tipo;
    lineas.push(`  class ${ids.join(",")} ${claseCss}`);
  });

  return lineas.join("\n");
}
