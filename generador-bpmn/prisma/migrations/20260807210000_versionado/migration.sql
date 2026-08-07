-- Versionado (docs/DISENO-VERSIONADO-F02.md §1.1, §5.2a)
-- Aditiva: tabla nueva + una columna nullable. No toca datos existentes.

-- CreateTable
CREATE TABLE "generador_bpmn"."DiagramVersion" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operacion" TEXT NOT NULL,
    "detalle" TEXT,
    "actores" JSONB NOT NULL,
    "pasos" JSONB NOT NULL,
    "huecosReconocidos" JSONB NOT NULL,
    "cliente" TEXT NOT NULL,
    "proceso" TEXT NOT NULL,

    CONSTRAINT "DiagramVersion_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "generador_bpmn"."Diagram" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "DiagramVersion_diagramId_createdAt_idx" ON "generador_bpmn"."DiagramVersion"("diagramId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DiagramVersion_diagramId_seq_key" ON "generador_bpmn"."DiagramVersion"("diagramId", "seq");

-- CreateIndex
CREATE INDEX "Diagram_userId_deletedAt_idx" ON "generador_bpmn"."Diagram"("userId", "deletedAt");

-- AddForeignKey
ALTER TABLE "generador_bpmn"."DiagramVersion"
  ADD CONSTRAINT "DiagramVersion_diagramId_fkey"
  FOREIGN KEY ("diagramId") REFERENCES "generador_bpmn"."Diagram"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
