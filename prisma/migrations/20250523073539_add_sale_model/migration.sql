-- CreateTable
CREATE TABLE "SalesHistory" (
    "id" SERIAL NOT NULL,
    "drugstoreId" INTEGER NOT NULL,
    "doseSold" INTEGER NOT NULL,
    "unitCostPrice" DOUBLE PRECISION NOT NULL,
    "salesPrice" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "dateSold" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesHistory_drugstoreId_idx" ON "SalesHistory"("drugstoreId");

-- AddForeignKey
ALTER TABLE "SalesHistory" ADD CONSTRAINT "SalesHistory_drugstoreId_fkey" FOREIGN KEY ("drugstoreId") REFERENCES "Drugstore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
