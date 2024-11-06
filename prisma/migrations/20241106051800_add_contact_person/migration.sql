/*
  Warnings:

  - Added the required column `contactPersonName` to the `Kerjain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPersonPhone` to the `Kerjain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Kerjain" ADD COLUMN     "contactPersonName" TEXT NOT NULL,
ADD COLUMN     "contactPersonPhone" TEXT NOT NULL;
