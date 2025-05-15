/*
  Warnings:

  - You are about to drop the column `amount` on the `sales` table. All the data in the column will be lost.
  - Added the required column `doseQuantity` to the `Drugstore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remainingQuantity` to the `Drugstore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitCostPrice` to the `Drugstore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `details` to the `history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `drugName` to the `history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doseSold` to the `sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profit` to the `sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitCostPrice` to the `sales` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "history" DROP CONSTRAINT "history_drugstoreId_fkey";

-- AlterTable
ALTER TABLE "Drugstore" ADD COLUMN     "doseQuantity" INTEGER NOT NULL,
ADD COLUMN     "remainingQuantity" INTEGER NOT NULL,
ADD COLUMN     "unitCostPrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "history" ADD COLUMN     "details" TEXT NOT NULL,
ADD COLUMN     "drugName" TEXT NOT NULL,
ALTER COLUMN "drugstoreId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "amount",
ADD COLUMN     "doseSold" INTEGER NOT NULL,
ADD COLUMN     "profit" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unitCostPrice" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "drugstoreId" DROP NOT NULL,
ALTER COLUMN "salesPrice" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_drugstoreId_fkey" FOREIGN KEY ("drugstoreId") REFERENCES "Drugstore"("id") ON DELETE SET NULL ON UPDATE CASCADE;
