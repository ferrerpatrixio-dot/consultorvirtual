-- Incremento 2 de F02: descomposición en subprocesos
-- (docs/DISENO-INCREMENTO-2-F02-DESCOMPOSICION.md §1.2)
-- AlterTable
ALTER TABLE "generador_bpmn"."Diagram"
  ADD COLUMN "parentDiagramId" TEXT,
  ADD COLUMN "parentPasoId" TEXT,
  ADD COLUMN "nivel" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "pasosBackup" JSONB;

-- CreateIndex
CREATE INDEX "Diagram_parentDiagramId_idx" ON "generador_bpmn"."Diagram"("parentDiagramId");

-- AddForeignKey
ALTER TABLE "generador_bpmn"."Diagram"
  ADD CONSTRAINT "Diagram_parentDiagramId_fkey"
  FOREIGN KEY ("parentDiagramId") REFERENCES "generador_bpmn"."Diagram"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
