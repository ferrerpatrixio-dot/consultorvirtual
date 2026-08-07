import { describe, expect, it } from "vitest";
import { claveHueco, evaluarCompletitud, tienePendientesSinResolver } from "@/lib/completitud";
import type { Paso } from "@/lib/diagramas";

// Smoke test: confirma que vitest + alias @/lib compilan y corren sobre
// código real del motor. Casos de reglas específicas son tarea de QA.
//
// Un diagrama vacío SÍ devuelve huecos (M1: falta inicio y falta fin), por
// eso el smoke solo verifica que la función corre y devuelve un arreglo.
describe("evaluarCompletitud", () => {
  it("devuelve un arreglo de huecos para un diagrama vacío", () => {
    expect(Array.isArray(evaluarCompletitud([]))).toBe(true);
  });

  function huecosDe(pasos: Paso[], regla: string) {
    return evaluarCompletitud(pasos).filter((h) => h.regla === regla);
  }

  // ── Bloque A — nombrado de actividades (A1/A2) ─────────────────────────
  describe("A1/A2 — nombrado de actividades", () => {
    it("QA-01: 'Ingreso a bodega' (sustantivo compuesto, sin verbo) — hueco de cobertura CONOCIDO: hoy no dispara ni A1 ni A2 porque el texto tiene espacio", () => {
      const pasos: Paso[] = [
        { id: "p1", tipo: "tarea", texto: "Ingreso a bodega", actor: "Bodeguero" },
      ];
      expect(huecosDe(pasos, "A1")).toHaveLength(0);
      expect(huecosDe(pasos, "A2")).toHaveLength(0);
    });

    it("QA-02: texto de una sola palabra ('Revisar') dispara A2 pendiente", () => {
      const pasos: Paso[] = [{ id: "p1", tipo: "tarea", texto: "Revisar", actor: "Analista" }];
      const a2 = huecosDe(pasos, "A2");
      expect(a2).toHaveLength(1);
      expect(a2[0].severidad).toBe("pendiente");
    });

    it("QA-04: decisión con texto vacío — hueco de cobertura CONOCIDO: A1/A2 solo miran tarea/sistema, no decision", () => {
      const pasos: Paso[] = [
        { id: "p1", tipo: "decision", texto: "", actor: "Analista", siguienteSi: "p2", siguienteNo: "p2" },
        { id: "p2", tipo: "fin_ok", texto: "Fin", actor: "" },
      ];
      expect(huecosDe(pasos, "A1")).toHaveLength(0);
      expect(huecosDe(pasos, "A2")).toHaveLength(0);
    });

    it("texto vacío en tarea sí dispara A1 bloqueante (control positivo)", () => {
      const pasos: Paso[] = [{ id: "p1", tipo: "tarea", texto: "", actor: "Analista" }];
      const a1 = huecosDe(pasos, "A1");
      expect(a1).toHaveLength(1);
      expect(a1[0].severidad).toBe("bloqueante");
    });
  });

  // ── Bloque B — actores (A3) ─────────────────────────────────────────────
  describe("A3 — actor asignado", () => {
    it("QA-05: actor: 'Sistema' — A3 no lo marca (no está vacío); A4 (Incremento 3) sí lo marca como sugerencia", () => {
      const pasos: Paso[] = [{ id: "p1", tipo: "tarea", texto: "Enviar correo", actor: "Sistema" }];
      expect(huecosDe(pasos, "A3")).toHaveLength(0);
      const a4 = huecosDe(pasos, "A4");
      expect(a4).toHaveLength(1);
      expect(a4[0].severidad).toBe("sugerencia");
    });

    it("QA-07: actor: '' dispara A3 pendiente", () => {
      const pasos: Paso[] = [{ id: "p1", tipo: "tarea", texto: "Enviar correo", actor: "" }];
      const a3 = huecosDe(pasos, "A3");
      expect(a3).toHaveLength(1);
      expect(a3[0].severidad).toBe("pendiente");
    });

    it("A3 también aplica a decisiones sin actor", () => {
      const pasos: Paso[] = [
        { id: "p1", tipo: "decision", texto: "¿Aprueba?", actor: "", siguienteSi: "p2", siguienteNo: "p2" },
        { id: "p2", tipo: "fin_ok", texto: "Fin", actor: "" },
      ];
      const a3 = huecosDe(pasos, "A3");
      expect(a3.some((h) => h.pasoId === "p1")).toBe(true);
    });
  });

  // ── Bloque C — decisiones y ramas (M2/M3) ───────────────────────────────
  describe("M2/M3 — decisiones y ramas", () => {
    it.skip("QA-09: decisión con 3+ destinos posibles — el modelo Paso solo soporta siguienteSi/siguienteNo (2 ramas). No es un caso de test del motor actual, es una limitación de modelo de datos.", () => {
      // Fuera de alcance: `Paso` no tiene forma de declarar una tercera rama.
      // Documentado para que quede registro; no se fuerza un test artificial.
    });

    it("QA-10: siguienteNo undefined dispara M2 bloqueante", () => {
      const pasos: Paso[] = [
        { id: "p1", tipo: "decision", texto: "¿Aprueba?", actor: "Jefe", siguienteSi: "p2" },
        { id: "p2", tipo: "fin_ok", texto: "Fin", actor: "" },
      ];
      const m2 = huecosDe(pasos, "M2");
      expect(m2).toHaveLength(1);
      expect(m2[0].severidad).toBe("bloqueante");
    });

    it("QA-11: dos ramas que nunca convergen y ninguna llega a fin — dispara M3 pendiente", () => {
      const pasos: Paso[] = [
        { id: "p1", tipo: "decision", texto: "¿Aprueba?", actor: "Jefe", siguienteSi: "p2", siguienteNo: "p3" },
        { id: "p2", tipo: "tarea", texto: "Hacer A", actor: "X", siguiente: "p2" }, // loop propio, nunca llega a fin
        { id: "p3", tipo: "tarea", texto: "Hacer B", actor: "X", siguiente: "p3" }, // loop propio, nunca llega a fin
      ];
      const m3 = huecosDe(pasos, "M3");
      expect(m3).toHaveLength(1);
      expect(m3[0].severidad).toBe("pendiente");
    });

    it("QA-11: caso frecuente — ambas ramas convergen directo en el mismo fin_ok sin paso intermedio común — hueco de cobertura CONOCIDO (falso negativo aceptado, decisión de ARQUITECTO-IT): hoy NO dispara M3", () => {
      const pasos: Paso[] = [
        { id: "p1", tipo: "decision", texto: "¿Aprueba?", actor: "Jefe", siguienteSi: "fin", siguienteNo: "fin" },
        { id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" },
      ];
      expect(huecosDe(pasos, "M3")).toHaveLength(0);
    });

    it("QA-12: loop sin condición de salida (decisión que vuelve sobre sí misma, formalmente válida) — confirma que hoy no dispara ninguna regla, fuera de alcance del motor", () => {
      const pasos: Paso[] = [
        { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "" , siguiente: "p1"},
        { id: "p1", tipo: "decision", texto: "¿Reintentar?", actor: "Analista", siguienteSi: "p1", siguienteNo: "p1" },
      ];
      const huecos = evaluarCompletitud(pasos);
      // No hay E2 (p1 es alcanzable), no hay M2 (ambas ramas tienen destino),
      // no hay M3 (ambas ramas "convergen" en sí mismo, p1). Solo puede
      // quedar M1 por falta de fin, que es esperado y no parte de este caso.
      expect(huecos.filter((h) => h.regla !== "M1")).toHaveLength(0);
    });
  });

  // ── Bloque D — estructura del flujo (M1/E2/E3) ──────────────────────────
  describe("M1/E2/E3 — estructura del flujo", () => {
    it("QA-13 (Incremento 3): dos pasos tipo 'inicio' en el mismo diagrama dispara M1 pendiente", () => {
      const pasos: Paso[] = [
        { id: "i1", tipo: "inicio", texto: "Inicio 1", actor: "", siguiente: "fin" },
        { id: "i2", tipo: "inicio", texto: "Inicio 2", actor: "", siguiente: "fin" },
        { id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" },
      ];
      const m1 = huecosDe(pasos, "M1");
      expect(m1).toHaveLength(1);
      expect(m1[0].severidad).toBe("pendiente");
    });

    it("Incremento 3: dos pasos fin_ok dispara M1 pendiente", () => {
      const pasos: Paso[] = [
        { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "fin1" },
        { id: "fin1", tipo: "fin_ok", texto: "Fin 1", actor: "" },
        { id: "fin2", tipo: "fin_ok", texto: "Fin 2", actor: "" },
      ];
      const m1 = huecosDe(pasos, "M1");
      expect(m1).toHaveLength(1);
      expect(m1[0].severidad).toBe("pendiente");
    });

    it("Incremento 3: un fin_ok + un fin_error juntos NO dispara M1 (modelado correcto, protege la decisión de §2.2)", () => {
      const pasos: Paso[] = [
        { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "d1" },
        {
          id: "d1",
          tipo: "decision",
          texto: "¿Aprueba?",
          actor: "Jefe",
          siguienteSi: "finOk",
          siguienteNo: "finError",
        },
        { id: "finOk", tipo: "fin_ok", texto: "Fin OK", actor: "" },
        { id: "finError", tipo: "fin_error", texto: "Fin con error", actor: "" },
      ];
      expect(huecosDe(pasos, "M1")).toHaveLength(0);
    });

    it("QA-14: paso tarea sin 'siguiente' dispara E3 bloqueante", () => {
      const pasos: Paso[] = [
        { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "p1" },
        { id: "p1", tipo: "tarea", texto: "Hacer algo", actor: "X" },
      ];
      const e3 = huecosDe(pasos, "E3");
      expect(e3).toHaveLength(1);
      expect(e3[0].severidad).toBe("bloqueante");
      expect(e3[0].pasoId).toBe("p1");
    });

    it("QA-15: paso al que ningún otro paso referencia como destino dispara E2 bloqueante", () => {
      const pasos: Paso[] = [
        { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "p1" },
        { id: "p1", tipo: "tarea", texto: "Hacer algo", actor: "X", siguiente: "fin" },
        { id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" },
        { id: "huerfano", tipo: "tarea", texto: "Paso huérfano", actor: "X", siguiente: "fin" },
      ];
      const e2 = huecosDe(pasos, "E2");
      expect(e2.some((h) => h.pasoId === "huerfano")).toBe(true);
    });

    it("QA-16: diagrama sin ningún paso 'inicio' dispara M1 bloqueante y NO genera un E2 por cada paso (guarda if (hayInicio) funciona correctamente)", () => {
      const pasos: Paso[] = [
        { id: "p1", tipo: "tarea", texto: "Hacer algo", actor: "X", siguiente: "fin" },
        { id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" },
      ];
      const huecos = evaluarCompletitud(pasos);
      const m1 = huecos.filter((h) => h.regla === "M1");
      expect(m1.some((h) => h.mensaje.includes("evento de inicio"))).toBe(true);
      expect(huecosDe(pasos, "E2")).toHaveLength(0);
    });
  });

  // ── Bloque E — casos especiales ─────────────────────────────────────────
  describe("Casos especiales", () => {
    it("QA-18: happy path perfecto (inicio → tareas con actor → decisión con ambas ramas → fin) devuelve huecos: []", () => {
      const pasos: Paso[] = [
        { id: "inicio", tipo: "inicio", texto: "Inicio", actor: "", siguiente: "t1" },
        { id: "t1", tipo: "tarea", texto: "Recibir solicitud", actor: "Recepcionista", siguiente: "d1" },
        { id: "d1", tipo: "decision", texto: "¿Cumple requisitos?", actor: "Analista", siguienteSi: "t2", siguienteNo: "t3" },
        { id: "t2", tipo: "tarea", texto: "Aprobar solicitud", actor: "Jefe", siguiente: "fin1" },
        { id: "t3", tipo: "tarea", texto: "Rechazar solicitud", actor: "Jefe", siguiente: "fin2" },
        { id: "fin1", tipo: "fin_ok", texto: "Fin exitoso", actor: "" },
        { id: "fin2", tipo: "fin_error", texto: "Fin con rechazo", actor: "" },
      ];
      expect(evaluarCompletitud(pasos)).toEqual([]);
    });

    // QA-20 (validación de nombres de flujo en exportar-bpmn.ts) queda fuera
    // de scope: no es responsabilidad de completitud.ts.
  });

  // ── Regresión — bug de "ids fantasma" en M3 ─────────────────────────────
  //
  // BUG ORIGINAL (ya corregido en `alcanzablesDesde`): una decisión cuyas
  // dos ramas apuntan al mismo id inexistente debía disparar M3 (ninguna
  // rama alcanza nada real), pero `alcanzablesDesde` recibía los ids de
  // arranque directo de `p.siguienteSi`/`p.siguienteNo` (sin pasar por
  // `destinosDe`) y agregaba el id fantasma a `visitados` ANTES de
  // comprobar si el paso existía. Fix: el chequeo de existencia ahora
  // ocurre antes de `visitados.add(id)`, así un id fantasma nunca queda
  // marcado como alcanzado, sea semilla inicial o destino intermedio.
  describe("M3 — regresión bug de ids fantasma", () => {
    it("decisión cuyas dos ramas apuntan al mismo id inexistente: dispara M3", () => {
      const pasos: Paso[] = [
        {
          id: "p1",
          tipo: "decision",
          texto: "¿Aprueba?",
          actor: "Jefe",
          siguienteSi: "fantasma",
          siguienteNo: "fantasma",
        },
      ];
      const m3 = huecosDe(pasos, "M3");
      expect(m3).toHaveLength(1);
    });
  });

  // ── M5 — destino inexistente (Incremento 3 §2.1) ────────────────────────
  describe("M5 — destino inexistente", () => {
    it("destino roto en 'siguiente' dispara M5 bloqueante", () => {
      const pasos: Paso[] = [
        { id: "p1", tipo: "tarea", texto: "Hacer algo", actor: "X", siguiente: "fantasma" },
      ];
      const m5 = huecosDe(pasos, "M5");
      expect(m5).toHaveLength(1);
      expect(m5[0].severidad).toBe("bloqueante");
      expect(m5[0].pasoId).toBe("p1");
    });

    it("destino roto en 'siguienteSi' dispara M5 bloqueante (una sola rama rota)", () => {
      const pasos: Paso[] = [
        { id: "p1", tipo: "decision", texto: "¿Aprueba?", actor: "Jefe", siguienteSi: "fantasma", siguienteNo: "p2" },
        { id: "p2", tipo: "fin_ok", texto: "Fin", actor: "" },
      ];
      const m5 = huecosDe(pasos, "M5");
      expect(m5).toHaveLength(1);
      expect(m5[0].mensaje).toContain('rama "Sí"');
    });

    it("las dos ramas rotas genera dos huecos M5", () => {
      const pasos: Paso[] = [
        {
          id: "p1",
          tipo: "decision",
          texto: "¿Aprueba?",
          actor: "Jefe",
          siguienteSi: "fantasma1",
          siguienteNo: "fantasma2",
        },
      ];
      expect(huecosDe(pasos, "M5")).toHaveLength(2);
    });

    it("destino válido no dispara M5", () => {
      const pasos: Paso[] = [
        { id: "p1", tipo: "tarea", texto: "Hacer algo", actor: "X", siguiente: "p2" },
        { id: "p2", tipo: "fin_ok", texto: "Fin", actor: "" },
      ];
      expect(huecosDe(pasos, "M5")).toHaveLength(0);
    });

    it("paso de fin sin destino no dispara M5", () => {
      const pasos: Paso[] = [{ id: "p1", tipo: "fin_ok", texto: "Fin", actor: "" }];
      expect(huecosDe(pasos, "M5")).toHaveLength(0);
    });

    it("borrar un paso referenciado limpia la referencia (quitarPasoAction) y no deja destino roto — regresión de la causa raíz de M5", () => {
      // Simula lo que hace quitarPasoAction: borra el paso "p2" y limpia el
      // campo `siguiente` de quien apuntaba a él (ver src/app/(app)/actions.ts).
      const antes: Paso[] = [
        { id: "p1", tipo: "tarea", texto: "Hacer algo", actor: "X", siguiente: "p2" },
        { id: "p2", tipo: "tarea", texto: "Otro paso", actor: "X", siguiente: "fin" },
        { id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" },
      ];
      const despues = antes
        .filter((p) => p.id !== "p2")
        .map((p) => ({ ...p, siguiente: p.siguiente === "p2" ? undefined : p.siguiente }));
      const m5 = evaluarCompletitud(despues).filter((h) => h.regla === "M5");
      expect(m5).toHaveLength(0);
    });
  });

  // ── A4 — actor genérico (Incremento 3 §2.4) ─────────────────────────────
  describe("A4 — actor genérico", () => {
    it('"Sistema" dispara A4 sugerencia', () => {
      const pasos: Paso[] = [{ id: "p1", tipo: "tarea", texto: "Enviar correo", actor: "Sistema" }];
      const a4 = huecosDe(pasos, "A4");
      expect(a4).toHaveLength(1);
      expect(a4[0].severidad).toBe("sugerencia");
    });

    it('"SISTEMA" (mayúsculas) también dispara A4', () => {
      const pasos: Paso[] = [{ id: "p1", tipo: "tarea", texto: "Enviar correo", actor: "SISTEMA" }];
      expect(huecosDe(pasos, "A4")).toHaveLength(1);
    });

    it('"Sistema de Bodega" NO dispara A4 (match exacto, no includes)', () => {
      const pasos: Paso[] = [
        { id: "p1", tipo: "tarea", texto: "Enviar correo", actor: "Sistema de Bodega" },
      ];
      expect(huecosDe(pasos, "A4")).toHaveLength(0);
    });

    it('"Bodeguero" (actor concreto) no dispara A4', () => {
      const pasos: Paso[] = [{ id: "p1", tipo: "tarea", texto: "Enviar correo", actor: "Bodeguero" }];
      expect(huecosDe(pasos, "A4")).toHaveLength(0);
    });
  });

  // ── Reconocimiento de pendientes (Incremento 3 §2.3) ─────────────────────
  describe("tienePendientesSinResolver + claveHueco — reconocimiento", () => {
    it("un pendiente reconocido deja de bloquear la exportación", () => {
      const pasos: Paso[] = [
        { id: "i1", tipo: "inicio", texto: "Inicio 1", actor: "", siguiente: "fin" },
        { id: "i2", tipo: "inicio", texto: "Inicio 2", actor: "", siguiente: "fin" },
        { id: "fin", tipo: "fin_ok", texto: "Fin", actor: "" },
      ];
      const huecos = evaluarCompletitud(pasos);
      const m1 = huecos.find((h) => h.regla === "M1" && h.severidad === "pendiente")!;
      expect(tienePendientesSinResolver(huecos, [])).toBe(true);
      expect(tienePendientesSinResolver(huecos, [claveHueco(m1)])).toBe(false);
    });

    it("un bloqueante 'reconocido' (payload manipulado) sigue bloqueado", () => {
      const pasos: Paso[] = [{ id: "p1", tipo: "tarea", texto: "", actor: "X" }]; // A1 bloqueante
      const huecos = evaluarCompletitud(pasos);
      const a1 = huecos.find((h) => h.regla === "A1")!;
      expect(tienePendientesSinResolver(huecos, [claveHueco(a1)])).toBe(true);
    });

    it("M5 'reconocido' (payload manipulado) sigue bloqueado", () => {
      const pasos: Paso[] = [
        { id: "p1", tipo: "tarea", texto: "Hacer algo", actor: "X", siguiente: "fantasma" },
      ];
      const huecos = evaluarCompletitud(pasos);
      const m5 = huecos.find((h) => h.regla === "M5")!;
      expect(tienePendientesSinResolver(huecos, [claveHueco(m5)])).toBe(true);
    });
  });
});
