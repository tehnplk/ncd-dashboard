/*
  Warnings:

  - You are about to alter the column `person_target` on the `CarbAmp` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `person_carb` on the `CarbAmp` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `person_diff` on the `CarbAmp` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "CarbAmp" ALTER COLUMN "person_target" SET DATA TYPE INTEGER,
ALTER COLUMN "person_carb" SET DATA TYPE INTEGER,
ALTER COLUMN "person_diff" SET DATA TYPE INTEGER;
