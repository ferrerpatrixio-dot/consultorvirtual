import { describe, expect, it } from "vitest";
import {
  agruparPorCategoria,
  macroprocesosSchema,
  normalizarNombre,
  revisarMapaValor,
  type Macroproceso,
} from "@/lib/valor";

function m(overrides: Partial<Macroproceso> & Pick<Macroproceso, "id" | "nombre" | "categoria">): Macroproceso {
  return { descripcion: "", propuestoPorIa: false, ...overrides };
}

describe("normalizarNombre", () => {
  it("recorta, minúsculas, sin acentos", () => {
    expect(normalizarNombre("  Gestión Comercial ")).toBe("gestion comercial");
  });
});

describe("macroprocesosSchema", () => {
  it("acepta una lista válida", () => {
    const lista = [
      m({ id: "m1", nombre: "Gestión comercial y de ventas", categoria: "core" }),
      m({ id: "m2", nombre: "Direccionamiento estratégico", categoria: "estrategico" }),
      m({ id: "m3", nombre: "Gestión financiera y administrativa", categoria: "soporte" }),
    ];
    expect(macroprocesosSchema.safeParse(lista).success).toBe(true);
  });

  it("rechaza nombres duplicados normalizados", () => {
    const lista = [
      m({ id: "m1", nombre: "Gestión Comercial", categoria: "core" }),
      m({ id: "m2", nombre: "gestion comercial", categoria: "core" }),
    ];
    expect(macroprocesosSchema.safeParse(lista).success).toBe(false);
  });

  it("rechaza más de 10 en una misma categoría", () => {
    const lista = Array.from({ length: 11 }, (_, i) =>
      m({ id: `m${i}`, nombre: `Gestión ${i}`, categoria: "core" }),
    );
    expect(macroprocesosSchema.safeParse(lista).success).toBe(false);
  });

  it("rechaza nombre vacío", () => {
    const lista = [m({ id: "m1", nombre: "", categoria: "core" })];
    expect(macroprocesosSchema.safeParse(lista).success).toBe(false);
  });

  it("rechaza más de 25 macroprocesos en total", () => {
    const lista = Array.from({ length: 26 }, (_, i) =>
      m({
        id: `m${i}`,
        nombre: `Macroproceso ${i}`,
        categoria: (["estrategico", "core", "soporte"] as const)[i % 3],
      }),
    );
    expect(macroprocesosSchema.safeParse(lista).success).toBe(false);
  });

  it("no valida la fórmula de nomenclatura — 'Ventas' a secas pasa", () => {
    const lista = [m({ id: "m1", nombre: "Ventas", categoria: "core" })];
    expect(macroprocesosSchema.safeParse(lista).success).toBe(true);
  });
});

describe("agruparPorCategoria — orden estable", () => {
  it("preserva el orden interno del array original dentro de cada categoría", () => {
    const lista: Macroproceso[] = [
      m({ id: "m1", nombre: "Z primer contacto", categoria: "core" }),
      m({ id: "m2", nombre: "A cierre de ciclo", categoria: "core" }),
      m({ id: "m3", nombre: "Dirección", categoria: "estrategico" }),
    ];
    const agrupado = agruparPorCategoria(lista);
    // El orden real de negocio es m1 (primer contacto) antes que m2 (cierra
    // el ciclo) — un sort alfabético invertiría esto (A antes que Z).
    expect(agrupado.core.map((m) => m.id)).toEqual(["m1", "m2"]);
  });

  it("no reordena alfabéticamente ni por ningún criterio derivado", () => {
    const lista: Macroproceso[] = [
      m({ id: "m3", nombre: "Tercero", categoria: "soporte" }),
      m({ id: "m1", nombre: "Primero", categoria: "soporte" }),
      m({ id: "m2", nombre: "Segundo", categoria: "soporte" }),
    ];
    const agrupado = agruparPorCategoria(lista);
    expect(agrupado.soporte.map((m) => m.id)).toEqual(["m3", "m1", "m2"]);
  });
});

describe("revisarMapaValor", () => {
  it("mapa incompleto con alcance 'unidad' devuelve solo V2 o nada (V1/V3/V4 suprimidos)", () => {
    // Sin core, sin estrategico, solo un soporte: dispararía V1/V3/V4 con
    // alcance "empresa", pero con "unidad" el sistema no puede retar al
    // usuario por un recorte que ya declaró.
    const lista: Macroproceso[] = [
      m({ id: "m1", nombre: "Gestión del soporte técnico", categoria: "soporte" }),
    ];
    const avisos = revisarMapaValor(lista, "unidad");
    expect(avisos.every((a) => a.id === "V2")).toBe(true);
  });

  it("el mismo mapa con alcance 'empresa' sí dispara V1/V3", () => {
    const lista: Macroproceso[] = [
      m({ id: "m1", nombre: "Gestión del soporte técnico", categoria: "soporte" }),
    ];
    const avisos = revisarMapaValor(lista, "empresa");
    expect(avisos.some((a) => a.id === "V1")).toBe(true);
    expect(avisos.some((a) => a.id === "V3")).toBe(true);
  });

  it("V2 dispara cuando todo sigue propuestoPorIa, siempre, sin importar el alcance", () => {
    const lista: Macroproceso[] = [
      m({ id: "m1", nombre: "Gestión comercial y de ventas", categoria: "core", propuestoPorIa: true }),
    ];
    const avisos = revisarMapaValor(lista, "unidad");
    expect(avisos.some((a) => a.id === "V2")).toBe(true);
  });

  it("V2 no dispara si el usuario editó al menos un macroproceso", () => {
    const lista: Macroproceso[] = [
      m({ id: "m1", nombre: "Gestión comercial y de ventas", categoria: "core", propuestoPorIa: false }),
    ];
    const avisos = revisarMapaValor(lista, "empresa");
    expect(avisos.some((a) => a.id === "V2")).toBe(false);
  });

  it("V4: categoría dominante con más del doble de la suma de las otras dos, solo con alcance empresa", () => {
    const lista: Macroproceso[] = [
      m({ id: "s1", nombre: "Gestión de compras y proveedores", categoria: "soporte" }),
      m({ id: "s2", nombre: "Gestión del talento humano", categoria: "soporte" }),
      m({ id: "s3", nombre: "Gestión de tecnología de la información", categoria: "soporte" }),
      m({ id: "s4", nombre: "Gestión de mantenimiento e infraestructura", categoria: "soporte" }),
      m({ id: "s5", nombre: "Gestión de datos e información", categoria: "soporte" }),
      m({ id: "e1", nombre: "Direccionamiento estratégico", categoria: "estrategico" }),
      m({ id: "c1", nombre: "Gestión comercial y de ventas", categoria: "core" }),
    ];
    expect(revisarMapaValor(lista, "empresa").some((a) => a.id === "V4")).toBe(true);
    expect(revisarMapaValor(lista, "sede").some((a) => a.id === "V4")).toBe(false);
  });

  it("nunca lanza sobre lista vacía", () => {
    expect(() => revisarMapaValor([], "empresa")).not.toThrow();
    expect(revisarMapaValor([], "empresa")).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "V1" })]),
    );
  });
});
