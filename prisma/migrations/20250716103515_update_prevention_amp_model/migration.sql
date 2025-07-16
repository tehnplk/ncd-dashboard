/*
  Warnings:

  - You are about to drop the column `normal_pop` on the `PreventionAmp` table. All the data in the column will be lost.
  - You are about to drop the column `officer_provider` on the `PreventionAmp` table. All the data in the column will be lost.
  - You are about to drop the column `osm_provider` on the `PreventionAmp` table. All the data in the column will be lost.
  - You are about to drop the column `prevention_visit` on the `PreventionAmp` table. All the data in the column will be lost.
  - You are about to drop the column `risk_pop` on the `PreventionAmp` table. All the data in the column will be lost.
  - You are about to drop the column `sick_pop` on the `PreventionAmp` table. All the data in the column will be lost.
  - You are about to drop the column `target_pop` on the `PreventionAmp` table. All the data in the column will be lost.
  - You are about to drop the column `total_officer` on the `PreventionAmp` table. All the data in the column will be lost.
  - You are about to drop the column `total_pop` on the `PreventionAmp` table. All the data in the column will be lost.
  - You are about to drop the column `trained` on the `PreventionAmp` table. All the data in the column will be lost.
  - You are about to drop the column `weight_reduce` on the `PreventionAmp` table. All the data in the column will be lost.
  - You are about to drop the column `weight_reduce_avg` on the `PreventionAmp` table. All the data in the column will be lost.
  - Added the required column `normal_population` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personnel_percentage` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personnel_registered` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `risk_population` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `risk_trained` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_recipients` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sick_population` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_personnel` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_volunteers` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volunteers_percentage` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volunteers_registered` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight_reduced_0_1` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight_reduced_1_2` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight_reduced_2_3` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight_reduced_3_4` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight_reduced_4_5` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight_reduced_over_5` to the `PreventionAmp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PreventionAmp" DROP COLUMN "normal_pop",
DROP COLUMN "officer_provider",
DROP COLUMN "osm_provider",
DROP COLUMN "prevention_visit",
DROP COLUMN "risk_pop",
DROP COLUMN "sick_pop",
DROP COLUMN "target_pop",
DROP COLUMN "total_officer",
DROP COLUMN "total_pop",
DROP COLUMN "trained",
DROP COLUMN "weight_reduce",
DROP COLUMN "weight_reduce_avg",
ADD COLUMN     "total_volunteers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "volunteers_registered" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "volunteers_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "total_personnel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "personnel_registered" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "personnel_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "service_recipients" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "normal_population" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "risk_population" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sick_population" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "risk_trained" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weight_reduced_0_1" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weight_reduced_1_2" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weight_reduced_2_3" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weight_reduced_3_4" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weight_reduced_4_5" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weight_reduced_over_5" INTEGER NOT NULL DEFAULT 0;
