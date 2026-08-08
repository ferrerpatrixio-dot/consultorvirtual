-- Nivel 1 de F02 (docs/DISENO-NIVELES-1-4-F02.md, Parte A)
-- Aditiva: tabla nueva + columnas nullable/con default. No toca datos existentes.

-- AlterTable
ALTER TABLE "generador_bpmn"."User" ADD COLUMN "trialValueMapsCreated" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "generador_bpmn"."ValueMap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "rubro" TEXT NOT NULL,
    "alcance" TEXT NOT NULL DEFAULT 'empresa',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "macroprocesos" JSONB NOT NULL DEFAULT '[]',
    "borradorLlm" JSONB NOT NULL DEFAULT '[]',
    "confirmadoAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ValueMap_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "generador_bpmn"."Diagram" ADD COLUMN "valueMapId" TEXT;
ALTER TABLE "generador_bpmn"."Diagram" ADD COLUMN "macroprocesoId" TEXT;

-- CreateIndex
CREATE INDEX "ValueMap_userId_deletedAt_idx" ON "generador_bpmn"."ValueMap"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Diagram_valueMapId_idx" ON "generador_bpmn"."Diagram"("valueMapId");

-- AddForeignKey
ALTER TABLE "generador_bpmn"."ValueMap"
  ADD CONSTRAINT "ValueMap_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "generador_bpmn"."User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generador_bpmn"."Diagram"
  ADD CONSTRAINT "Diagram_valueMapId_fkey"
  FOREIGN KEY ("valueMapId") REFERENCES "generador_bpmn"."ValueMap"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
