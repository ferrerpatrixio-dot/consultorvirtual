import { describe, expect, it } from "vitest";
import {
  debeCoalescer,
  idsSubprocesoDePasos,
  reconciliarSubprocesos,
  etiquetaOperacion,
} from "@/lib/versionado";

// Versionado (docs/DISENO-VERSIONADO-F02.md). Mismo patrón que
// completitud.test.ts / descomposicion.test.ts: funciones puras, casos
// fijos, sin BD.

describe("debeCoalescer — regla de coalescencia (§2.1)", () => {
  const ahora = new Date("2026-08-07T12:00:00Z");

  it("no coalesce si no hay versión previa", () => {
    expect(debeCoalescer(null, "editar_paso", "p1", ahora)).toBe(false);
  });

  it("coalesce si misma operación, mismo detalle, y hace menos de 5 minutos", () => {
    const ultima = {
      seq: 3,
      operacion: "editar_paso",
      detalle: "p1",
      createdAt: new Date("2026-08-07T11:58:00Z"), // hace 2 minutos
    };
    expect(debeCoalescer(ultima, "editar_paso", "p1", ahora)).toBe(true);
  });

  it("NO coalesce si pasaron 5 minutos o más", () => {
    const ultima = {
      seq: 3,
      operacion: "editar_paso",
      detalle: "p1",
      createdAt: new Date("2026-08-07T11:55:00Z"), // hace 5 minutos exactos
    };
    expect(debeCoalescer(ultima, "editar_paso", "p1", ahora)).toBe(false);
  });

  it("NO coalesce si cambia la operación", () => {
    const ultima = {
      seq: 3,
      operacion: "editar_paso",
      detalle: "p1",
      createdAt: new Date("2026-08-07T11:59:00Z"),
    };
    expect(debeCoalescer(ultima, "mover_paso", "p1", ahora)).toBe(false);
  });

  it("NO coalesce si cambia el detalle (otro pasoId)", () => {
    const ultima = {
      seq: 3,
      operacion: "editar_paso",
      detalle: "p1",
      createdAt: new Date("2026-08-07T11:59:00Z"),
    };
    expect(debeCoalescer(ultima, "editar_paso", "p2", ahora)).toBe(false);
  });

  it.each(["quitar_paso", "descomponer", "restaurar"] as const)(
    "'%s' nunca coalesce, aunque sea idéntica a la anterior y reciente",
    (operacion) => {
      const ultima = {
        seq: 3,
        operacion,
        detalle: "p1",
        createdAt: new Date("2026-08-07T11:59:59Z"),
      };
      expect(debeCoalescer(ultima, operacion, "p1", ahora)).toBe(false);
    },
  );
});

describe("idsSubprocesoDePasos", () => {
  it("extrae solo los ids de pasos tipo subproceso con enlace", () => {
    const pasos = [
      { id: "1", tipo: "tarea", texto: "x" },
      { id: "2", tipo: "subproceso", texto: "y", subprocesoDiagramId: "hijo-1" },
      { id: "3", tipo: "subproceso", texto: "z", subprocesoDiagramId: "hijo-2" },
    ];
    expect(idsSubprocesoDePasos(pasos)).toEqual(["hijo-1", "hijo-2"]);
  });

  it("devuelve [] ante Json corrupto o inesperado", () => {
    expect(idsSubprocesoDePasos(null)).toEqual([]);
    expect(idsSubprocesoDePasos("no es un array")).toEqual([]);
  });
});

describe("reconciliarSubprocesos — tabla del §5.2b (pieza no recortable)", () => {
  it("caso: en V y en A → sobrevive, sin acción", () => {
    const r = reconciliarSubprocesos(["h1"], ["h1"], new Set(["h1"]), new Set());
    expect(r).toEqual([{ subprocesoDiagramId: "h1", caso: "sobrevive" }]);
  });

  it("caso: en V, no en A, existe con borrado lógico → revivir", () => {
    const r = reconciliarSubprocesos(["h1"], [], new Set(), new Set(["h1"]));
    expect(r).toEqual([{ subprocesoDiagramId: "h1", caso: "revivir" }]);
  });

  it("caso: en V, no en A, purgado físicamente (no existe) → degradar", () => {
    const r = reconciliarSubprocesos(["h1"], [], new Set(), new Set());
    expect(r).toEqual([{ subprocesoDiagramId: "h1", caso: "degradar" }]);
  });

  it("caso: en A, no en V → borrado lógico del hijo sobrante", () => {
    const r = reconciliarSubprocesos([], ["h1"], new Set(["h1"]), new Set());
    expect(r).toEqual([{ subprocesoDiagramId: "h1", caso: "borrado_logico" }]);
  });

  it("combina varios casos en la misma restauración", () => {
    const r = reconciliarSubprocesos(
      ["sobrevive", "revivir", "degradar"],
      ["sobrevive", "nuevo"],
      new Set(["sobrevive"]),
      new Set(["revivir"]),
    );
    expect(r).toEqual(
      expect.arrayContaining([
        { subprocesoDiagramId: "sobrevive", caso: "sobrevive" },
        { subprocesoDiagramId: "revivir", caso: "revivir" },
        { subprocesoDiagramId: "degradar", caso: "degradar" },
        { subprocesoDiagramId: "nuevo", caso: "borrado_logico" },
      ]),
    );
    expect(r).toHaveLength(4);
  });

  it("no revienta con arrays vacíos (diagrama sin subprocesos)", () => {
    expect(reconciliarSubprocesos([], [], new Set(), new Set())).toEqual([]);
  });
});

describe("etiquetaOperacion", () => {
  it("arma el texto con detalle cuando viene", () => {
    expect(etiquetaOperacion("quitar_paso", "Validar stock")).toBe(
      'Se quitó un paso «Validar stock»',
    );
  });

  it("arma el texto sin detalle", () => {
    expect(etiquetaOperacion("restaurar", null)).toBe("Se restauró una versión anterior");
  });

  it("cae al nombre crudo de la operación si no está en el mapa", () => {
    expect(etiquetaOperacion("algo_nuevo", null)).toBe("algo_nuevo");
  });
});
