-- AlterTable
ALTER TABLE "generador_bpmn"."User" ADD COLUMN     "subscriptionStatus" TEXT,
ADD COLUMN     "mercadopagoPreapprovalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_mercadopagoPreapprovalId_key" ON "generador_bpmn"."User"("mercadopagoPreapprovalId");
