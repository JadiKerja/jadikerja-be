/*
  Warnings:

  - You are about to drop the column `mapPoint` on the `Kerjain` table. All the data in the column will be lost.
  - Added the required column `lat` to the `Kerjain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lng` to the `Kerjain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Kerjain" DROP COLUMN "mapPoint",
ADD COLUMN     "lat" INTEGER NOT NULL,
ADD COLUMN     "lng" INTEGER NOT NULL;
