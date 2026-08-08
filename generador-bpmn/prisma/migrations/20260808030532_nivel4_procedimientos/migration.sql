-- CreateTable
CREATE TABLE "Procedimiento" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pasoId" TEXT NOT NULL,
    "contenido" JSONB NOT NULL,
    "promptFuente" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Procedimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Procedimiento_diagramId_deletedAt_idx" ON "Procedimiento"("diagramId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Procedimiento_diagramId_pasoId_key" ON "Procedimiento"("diagramId", "pasoId");

-- AddForeignKey
ALTER TABLE "Procedimiento" ADD CONSTRAINT "Procedimiento_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
