/*
  Warnings:

  - Added the required column `ressourceTypeId` to the `Ressource` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ressource" ADD COLUMN     "ressourceTypeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Ressource" ADD CONSTRAINT "Ressource_ressourceTypeId_fkey" FOREIGN KEY ("ressourceTypeId") REFERENCES "RessourceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
