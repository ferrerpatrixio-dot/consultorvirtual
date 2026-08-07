/**
 * Script de SOLO LECTURA — Incremento 3 de F02 (docs/DISENO-INCREMENTO-3-F02.md §4).
 *
 * Cuenta, contra los diagramas ya guardados en la base real, cuántos
 * tendrían al menos un hueco M5 (destino inexistente) una vez que la regla
 * exista. M5 es bloqueante: si el número es material, hay que decidir con
 * Patricio si hace falta comunicar a esos usuarios antes de deployar.
 *
 * No escribe nada en la base. Uso:
 *   DATABASE_URL=... npx tsx scripts/conteo-impacto-m5.ts
 */
import { prisma } from "@/lib/prisma";
import { parsePasos } from "@/lib/diagramas";
import { evaluarCompletitud } from "@/lib/completitud";

async function main() {
  const diagramas = await prisma.diagram.findMany({
    select: { id: true, cliente: true, proceso: true, pasos: true },
  });

  const rotos: { id: string; cliente: string; proceso: string; cantidadM5: number }[] = [];

  for (const d of diagramas) {
    const pasos = parsePasos(d.pasos);
    const huecosM5 = evaluarCompletitud(pasos).filter((h) => h.regla === "M5");
    if (huecosM5.length > 0) {
      rotos.push({ id: d.id, cliente: d.cliente, proceso: d.proceso, cantidadM5: huecosM5.length });
    }
  }

  console.log(`Diagramas totales en BD: ${diagramas.length}`);
  console.log(`Diagramas con al menos un destino roto (M5): ${rotos.length}`);
  if (rotos.length > 0) {
    console.log("Detalle:");
    for (const r of rotos) {
      console.log(`  - ${r.id} (${r.cliente} / ${r.proceso}): ${r.cantidadM5} destino(s) roto(s)`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
