import { describe, expect, it } from "vitest";
import { esRegionSESE, proponerCorte, construirCorte } from "@/lib/descomposicion";
import { evaluarCompletitud, UMBRAL_M4_NODOS, UMBRAL_AVISO_NODOS } from "@/lib/completitud";
import type { Paso } from "@/lib/diagramas";

// Incremento 2 de F02 — descomposición en subprocesos
// (docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md). Mismo patrón que
// completitud.test.ts: casos fijos, sin LLM, determinístico.

/** Genera un diagrama lineal de N pasos (inicio -> tarea x N -> fin_ok),
 * todos del mismo actor, útil para probar el umbral M4 sin construir un
 * caso a mano de 51 pasos. */
function diagramaLineal(n: number): Paso[] {
  const pasos: Paso[] = [{ id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "t0" }];
  for (let i = 0; i < n; i++) {
    pasos.push({
      id: `t${i}`,
      tipo: "tarea",
      texto: `Hacer paso ${i}`,
      actor: "Analista",
      siguiente: i + 1 < n ? `t${i + 1}` : "fin",
    });
  }
  pasos.push({ id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" });
  return pasos;
}

describe("M4 — tope de tamaño (G7)", () => {
  it("50 nodos exactos no dispara el tope duro M4 (solo el aviso preventivo de >40, con severidad 'sugerencia')", () => {
    // inicio + 48 tareas + fin = 50 nodos exactos.
    const pasos = diagramaLineal(48);
    expect(pasos.length).toBe(UMBRAL_M4_NODOS);
    const m4 = evaluarCompletitud(pasos).filter((h) => h.regla === "M4");
    expect(m4).toHaveLength(1);
    expect(m4[0].severidad).toBe("sugerencia");
  });

  it("diagrama de 51 nodos dispara M4 con severidad 'pendiente', no 'bloqueante'", () => {
    const pasos = diagramaLineal(49); // inicio + 49 + fin = 51
    expect(pasos.length).toBe(UMBRAL_M4_NODOS + 1);
    const m4 = evaluarCompletitud(pasos).filter((h) => h.regla === "M4");
    expect(m4).toHaveLength(1);
    expect(m4[0].severidad).toBe("pendiente");
  });

  it("41 nodos dispara aviso preventivo M4 con severidad 'sugerencia' (no bloquea exportación)", () => {
    const pasos = diagramaLineal(39); // inicio + 39 + fin = 41
    expect(pasos.length).toBe(UMBRAL_AVISO_NODOS + 1);
    const m4 = evaluarCompletitud(pasos).filter((h) => h.regla === "M4");
    expect(m4).toHaveLength(1);
    expect(m4[0].severidad).toBe("sugerencia");
  });

  it("40 nodos exactos no dispara ningún aviso (umbral es estrictamente mayor a 40)", () => {
    const pasos = diagramaLineal(38); // inicio + 38 + fin = 40
    expect(pasos.length).toBe(UMBRAL_AVISO_NODOS);
    expect(evaluarCompletitud(pasos).filter((h) => h.regla === "M4")).toHaveLength(0);
  });

  it("arcos no cuentan como nodos: una decisión con dos ramas sigue sumando 1 nodo, no 3", () => {
    const pasos: Paso[] = [
      { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "d1" },
      { id: "d1", tipo: "decision", texto: "¿Aprueba?", actor: "Jefe", siguienteSi: "fin1", siguienteNo: "fin2" },
      { id: "fin1", tipo: "fin_ok", texto: "Fin OK", actor: "" },
      { id: "fin2", tipo: "fin_error", texto: "Fin error", actor: "" },
    ];
    // 4 nodos, muy por debajo del umbral — solo confirma que el conteo es
    // pasos.length y no cuenta los 2 arcos de la decisión como nodos extra.
    expect(pasos.length).toBe(4);
    expect(evaluarCompletitud(pasos).filter((h) => h.regla === "M4")).toHaveLength(0);
  });
});

describe("esRegionSESE", () => {
  const pasos: Paso[] = [
    { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "a" },
    { id: "a", tipo: "tarea", texto: "Recibir solicitud", actor: "Recepción", siguiente: "b" },
    { id: "b", tipo: "tarea", texto: "Validar datos", actor: "Recepción", siguiente: "c" },
    { id: "c", tipo: "tarea", texto: "Archivar", actor: "Bodega", siguiente: "fin" },
    { id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" },
  ];

  it("un tramo con una entrada y una salida es SESE", () => {
    expect(esRegionSESE(pasos, ["a", "b"])).toBe(true);
  });

  it("un tramo con dos entradas externas no es SESE", () => {
    const conBifurcacion: Paso[] = [
      { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "d1" },
      { id: "d1", tipo: "decision", texto: "¿A o B?", actor: "Jefe", siguienteSi: "a", siguienteNo: "b" },
      { id: "a", tipo: "tarea", texto: "Camino A", actor: "X", siguiente: "c" },
      { id: "b", tipo: "tarea", texto: "Camino B", actor: "X", siguiente: "c" },
      { id: "c", tipo: "tarea", texto: "Junta", actor: "X", siguiente: "fin" },
      { id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" },
    ];
    // {a, b, c}: dos arcos entran (d1->a, d1->b), uno sale (c->fin).
    expect(esRegionSESE(conBifurcacion, ["a", "b", "c"])).toBe(false);
  });

  it("un tramo con un id que no existe en el diagrama no es SESE (selección inválida)", () => {
    expect(esRegionSESE(pasos, ["a", "fantasma"])).toBe(false);
  });

  it("el diagrama entero no es SESE (0 arcos externos, no 1)", () => {
    expect(esRegionSESE(pasos, pasos.map((p) => p.id))).toBe(false);
  });
});

describe("proponerCorte", () => {
  it("propone el tramo contiguo más largo de un mismo actor que es SESE", () => {
    const pasos: Paso[] = [
      { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "a" },
      { id: "a", tipo: "tarea", texto: "Recibir solicitud", actor: "Recepción", siguiente: "b" },
      { id: "b", tipo: "tarea", texto: "Validar datos", actor: "Recepción", siguiente: "c" },
      { id: "c", tipo: "tarea", texto: "Aprobar", actor: "Jefe", siguiente: "fin" },
      { id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" },
    ];
    const propuesta = proponerCorte(pasos);
    expect(propuesta).not.toBeNull();
    expect(propuesta!.pasoIds).toEqual(["a", "b"]);
    expect(propuesta!.actor).toBe("Recepción");
  });

  it("cuando ningún tramo por actor es SESE, cae al SESE más largo del diagrama entero", () => {
    // a y b son de actores distintos pero contiguos y SESE juntos; ningún
    // tramo de un solo actor de largo >= 2 existe acá.
    const pasos: Paso[] = [
      { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "a" },
      { id: "a", tipo: "tarea", texto: "Recibir", actor: "Recepción", siguiente: "b" },
      { id: "b", tipo: "tarea", texto: "Archivar", actor: "Bodega", siguiente: "fin" },
      { id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" },
    ];
    const propuesta = proponerCorte(pasos);
    expect(propuesta).not.toBeNull();
    expect(propuesta!.pasoIds).toEqual(["a", "b"]);
  });

  it("devuelve null cuando no hay ningún tramo SESE de largo >= 2 (diagrama de un solo paso útil)", () => {
    const pasos: Paso[] = [
      { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "a" },
      { id: "a", tipo: "tarea", texto: "Único paso", actor: "X", siguiente: "fin" },
      { id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" },
    ];
    expect(proponerCorte(pasos)).toBeNull();
  });
});

describe("construirCorte", () => {
  const pasos: Paso[] = [
    { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "a" },
    { id: "a", tipo: "tarea", texto: "Recibir solicitud", actor: "Recepción", siguiente: "b" },
    { id: "b", tipo: "tarea", texto: "Validar datos", actor: "Recepción", siguiente: "c" },
    { id: "c", tipo: "tarea", texto: "Aprobar", actor: "Jefe", siguiente: "fin" },
    { id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" },
  ];

  it("el hijo queda con inicio y fin sintéticos, y el tramo íntegro entre ambos", () => {
    const corte = construirCorte(pasos, ["a", "b"], "Recepción de solicitud");
    expect(corte.pasosHijo.map((p) => p.tipo)).toEqual(["inicio", "tarea", "tarea", "fin_ok"]);
    expect(corte.pasosHijo[0].siguiente).toBe("a");
    // el "siguiente" externo de "b" (-> "c") se remapea al fin sintético.
    const bHijo = corte.pasosHijo.find((p) => p.id === "b")!;
    expect(bHijo.siguiente).toBe(corte.pasosHijo[corte.pasosHijo.length - 1].id);
  });

  it("el padre queda con el tramo reemplazado por un único nodo 'subproceso', flujo íntegro", () => {
    const corte = construirCorte(pasos, ["a", "b"], "Recepción de solicitud");
    const ids = corte.pasosPadre.map((p) => p.id);
    expect(ids).not.toContain("a");
    expect(ids).not.toContain("b");
    expect(corte.pasosPadre.some((p) => p.tipo === "subproceso")).toBe(true);

    // el "siguiente" de inicio ahora apunta al nodo subproceso, no a "a".
    const inicioPadre = corte.pasosPadre.find((p) => p.id === "inicio")!;
    expect(inicioPadre.siguiente).toBe(corte.nuevoNodo.id);

    // el nodo subproceso sigue apuntando a "c" (destino externo original).
    expect(corte.nuevoNodo.siguiente).toBe("c");

    // CASO DE QA OBLIGATORIO (pedido por PRODUCT MANAGER): el flujo del
    // padre sigue siendo evaluable por el motor de completitud sin nuevos
    // huecos de estructura (E2/E3/M1) después del corte — "subproceso" se
    // trata como actividad para el resto del motor.
    const huecosPadre = evaluarCompletitud(corte.pasosPadre);
    expect(huecosPadre.filter((h) => ["E2", "E3", "M1"].includes(h.regla))).toHaveLength(0);
  });

  it("el actor dominante del tramo queda asignado al nodo subproceso", () => {
    const corte = construirCorte(pasos, ["a", "b"], "Recepción de solicitud");
    expect(corte.nuevoNodo.actor).toBe("Recepción");
  });
});
