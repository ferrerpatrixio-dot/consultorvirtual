import { describe, expect, it } from "vitest";
import {
  coberturaProcedimientos,
  elegiblePasoProcedimiento,
  generarManualMarkdown,
  parseContenidoProcedimiento,
  procedimientoSchema,
  type ProcedimientoContenido,
} from "@/lib/procedimientos";
import type { Paso } from "@/lib/diagramas";

function paso(overrides: Partial<Paso> & Pick<Paso, "id" | "tipo">): Paso {
  return { actor: "Alguien", texto: "Hace algo", ...overrides };
}

describe("elegiblePasoProcedimiento", () => {
  it("acepta tarea y sistema", () => {
    expect(elegiblePasoProcedimiento({ tipo: "tarea" })).toBe(true);
    expect(elegiblePasoProcedimiento({ tipo: "sistema" })).toBe(true);
  });

  it("rechaza inicio/fin/decision/subproceso", () => {
    expect(elegiblePasoProcedimiento({ tipo: "inicio" })).toBe(false);
    expect(elegiblePasoProcedimiento({ tipo: "fin_ok" })).toBe(false);
    expect(elegiblePasoProcedimiento({ tipo: "fin_error" })).toBe(false);
    expect(elegiblePasoProcedimiento({ tipo: "decision" })).toBe(false);
    expect(elegiblePasoProcedimiento({ tipo: "subproceso" })).toBe(false);
  });
});

describe("coberturaProcedimientos", () => {
  it("cuenta solo pasos elegibles, y los que tienen procedimiento", () => {
    const pasos: Paso[] = [
      paso({ id: "p1", tipo: "inicio" }),
      paso({ id: "p2", tipo: "tarea" }),
      paso({ id: "p3", tipo: "sistema" }),
      paso({ id: "p4", tipo: "decision" }),
      paso({ id: "p5", tipo: "fin_ok" }),
    ];
    const procedimientos = [{ pasoId: "p2" }];

    const c = coberturaProcedimientos(pasos, procedimientos);
    expect(c.elegibles).toBe(2); // p2, p3
    expect(c.conProcedimiento).toBe(1);
    expect(c.faltantes).toEqual(["p3"]);
  });

  it("sin pasos elegibles: 0/0, sin faltantes", () => {
    const pasos: Paso[] = [paso({ id: "p1", tipo: "inicio" }), paso({ id: "p2", tipo: "fin_ok" })];
    const c = coberturaProcedimientos(pasos, []);
    expect(c).toEqual({ elegibles: 0, conProcedimiento: 0, faltantes: [] });
  });

  it("un pasoId de procedimiento que no corresponde a ningún paso elegible no infla el conteo", () => {
    const pasos: Paso[] = [paso({ id: "p1", tipo: "tarea" })];
    // procedimiento "huérfano" (paso ya no existe) no debe contarse.
    const c = coberturaProcedimientos(pasos, [{ pasoId: "px" }]);
    expect(c.elegibles).toBe(1);
    expect(c.conProcedimiento).toBe(0);
    expect(c.faltantes).toEqual(["p1"]);
  });
});

describe("procedimientoSchema", () => {
  it("acepta contenido mínimo válido", () => {
    const r = procedimientoSchema.safeParse({
      objetivo: "Cotizar el repuesto",
      instrucciones: [{ orden: 1, accion: "Abrir el sistema" }],
      resultadoEsperado: "Cotización enviada",
    });
    expect(r.success).toBe(true);
  });

  it("rechaza sin instrucciones", () => {
    const r = procedimientoSchema.safeParse({
      objetivo: "x",
      instrucciones: [],
      resultadoEsperado: "y",
    });
    expect(r.success).toBe(false);
  });
});

describe("parseContenidoProcedimiento", () => {
  it("devuelve null ante Json corrupto", () => {
    expect(parseContenidoProcedimiento({ foo: "bar" })).toBeNull();
  });

  it("parsea contenido válido", () => {
    const valido = {
      objetivo: "x",
      precondiciones: [],
      instrucciones: [{ orden: 1, accion: "hacer algo" }],
      resultadoEsperado: "y",
      excepciones: [],
      faltantes: [],
    };
    expect(parseContenidoProcedimiento(valido)).not.toBeNull();
  });
});

describe("generarManualMarkdown", () => {
  const contenido: ProcedimientoContenido = {
    objetivo: "Cotizar el repuesto",
    precondiciones: ["Cliente identificado"],
    instrucciones: [{ orden: 1, accion: "Abrir el sistema", herramienta: "SAP" }],
    resultadoEsperado: "Cotización enviada",
    excepciones: [{ situacion: "no hay stock", queHacer: "avisar a Bodega" }],
    faltantes: [],
  };

  it("declara la cobertura al inicio y nombra los pasos faltantes", () => {
    const pasos: Paso[] = [
      paso({ id: "p1", tipo: "tarea", texto: "Cotiza repuesto" }),
      paso({ id: "p2", tipo: "tarea", texto: "Factura" }),
    ];
    const md = generarManualMarkdown("Ventas", pasos, new Map([["p1", contenido]]));
    expect(md).toContain("documentados 1 de 2 pasos");
    expect(md).toContain("Factura");
    expect(md).toContain("Cotiza repuesto");
    expect(md).toContain("Abrir el sistema");
  });

  it("nunca oculta que un paso elegible no tiene procedimiento", () => {
    const pasos: Paso[] = [paso({ id: "p1", tipo: "sistema", texto: "Registra pago" })];
    const md = generarManualMarkdown("Cobranza", pasos, new Map());
    expect(md).toContain("Sin procedimiento documentado todavía");
  });
});
