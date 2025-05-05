-- CreateTable
CREATE TABLE "SharedRessource" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ressourceId" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedRessource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SharedRessource_ressourceId_idx" ON "SharedRessource"("ressourceId");

-- CreateIndex
CREATE INDEX "SharedRessource_userId_idx" ON "SharedRessource"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SharedRessource_userId_ressourceId_key" ON "SharedRessource"("userId", "ressourceId");

-- AddForeignKey
ALTER TABLE "SharedRessource" ADD CONSTRAINT "SharedRessource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedRessource" ADD CONSTRAINT "SharedRessource_ressourceId_fkey" FOREIGN KEY ("ressourceId") REFERENCES "Ressource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
