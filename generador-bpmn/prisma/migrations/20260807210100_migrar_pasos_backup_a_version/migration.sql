-- Versionado (docs/DISENO-VERSIONADO-F02.md §1.2)
-- Migra Diagram.pasosBackup (backup de un solo uso, vive HOY en el diagrama
-- hijo) a una fila DiagramVersion que apunta al diagrama PADRE — que es
-- semánticamente donde corresponde: pasosBackup es el estado del padre
-- justo antes del corte que originó ese hijo, no un estado del hijo.
--
-- seq se numera con ROW_NUMBER() por diagrama padre (ordenado por
-- createdAt del hijo, que refleja el orden cronológico real de los cortes)
-- porque un mismo padre puede tener varios hijos, cada uno con su propio
-- pasosBackup, y @@unique([diagramId, seq]) no admite dos filas con
-- seq = 1 para el mismo padre.
--
-- Después de migrar los datos, se elimina la columna: mantener dos vías de
-- deshacer vivas a la vez es peor que ninguna (§1.2 del diseño).

INSERT INTO "generador_bpmn"."DiagramVersion"
  ("id", "diagramId", "userId", "seq", "createdAt", "operacion", "detalle",
   "actores", "pasos", "huecosReconocidos", "cliente", "proceso")
SELECT
  gen_random_uuid()::text,
  padre.id,
  padre."userId",
  ROW_NUMBER() OVER (PARTITION BY padre.id ORDER BY hijo."createdAt"),
  hijo."createdAt",
  'descomponer',
  hijo.proceso,
  padre.actores,
  hijo."pasosBackup",
  padre."huecosReconocidos",
  padre.cliente,
  padre.proceso
FROM "generador_bpmn"."Diagram" hijo
JOIN "generador_bpmn"."Diagram" padre ON padre.id = hijo."parentDiagramId"
WHERE hijo."pasosBackup" IS NOT NULL;

-- AlterTable
ALTER TABLE "generador_bpmn"."Diagram" DROP COLUMN "pasosBackup";
