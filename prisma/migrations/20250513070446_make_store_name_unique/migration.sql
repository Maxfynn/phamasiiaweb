/*
  Warnings:

  - A unique constraint covering the columns `[StoreName]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Customer_StoreName_key" ON "Customer"("StoreName");
