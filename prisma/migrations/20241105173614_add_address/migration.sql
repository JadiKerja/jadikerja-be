/*
  Warnings:

  - You are about to drop the column `requirements` on the `Kerjain` table. All the data in the column will be lost.
  - Added the required column `address` to the `Kerjain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Kerjain" DROP COLUMN "requirements",
ADD COLUMN     "address" TEXT NOT NULL;
