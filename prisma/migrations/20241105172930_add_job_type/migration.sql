/*
  Warnings:

  - Added the required column `type` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JOB_TYPE" AS ENUM ('SPECIALIZATION', 'NOT_SPECIALIZATION');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "type" "JOB_TYPE" NOT NULL;
