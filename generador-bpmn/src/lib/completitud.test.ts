import { describe, expect, it } from "vitest";
import { evaluarCompletitud } from "@/lib/completitud";

// Smoke test: confirma que vitest + alias @/lib compilan y corren sobre
// código real del motor. Casos de reglas específicas son tarea de QA.
//
// Un diagrama vacío SÍ devuelve huecos (M1: falta inicio y falta fin), por
// eso el smoke solo verifica que la función corre y devuelve un arreglo.
describe("evaluarCompletitud", () => {
  it("devuelve un arreglo de huecos para un diagrama vacío", () => {
    expect(Array.isArray(evaluarCompletitud([]))).toBe(true);
  });
});
