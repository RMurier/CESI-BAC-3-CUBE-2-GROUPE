/*
  Warnings:

  - Added the required column `userId` to the `Ressource` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ressource" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Ressource" ADD CONSTRAINT "Ressource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
