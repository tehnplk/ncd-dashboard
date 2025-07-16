-- CreateTable
CREATE TABLE "Carb" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hoscode" TEXT NOT NULL,
    "hosname" TEXT NOT NULL,
    "hostype" TEXT NOT NULL,
    "tmb_code" TEXT NOT NULL,
    "tmb_name" TEXT NOT NULL,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "person_target" REAL NOT NULL,
    "person_carb" REAL NOT NULL,
    "percentage" REAL NOT NULL,
    "person_diff" REAL NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Camp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Chospital" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hoscode" TEXT NOT NULL,
    "hosname" TEXT NOT NULL,
    "hostype" TEXT NOT NULL,
    "tmb_code" TEXT NOT NULL,
    "tmb_name" TEXT NOT NULL,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "flag_activate" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Prevention" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hoscode" TEXT NOT NULL,
    "hosname" TEXT NOT NULL,
    "hostype" TEXT NOT NULL,
    "tmb_code" TEXT NOT NULL,
    "tmb_name" TEXT NOT NULL,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "total_officer" INTEGER NOT NULL,
    "total_pop" INTEGER NOT NULL,
    "osm_provider" INTEGER NOT NULL,
    "officer_provider" INTEGER NOT NULL,
    "target_pop" INTEGER NOT NULL,
    "prevention_visit" INTEGER NOT NULL,
    "normal_pop" INTEGER NOT NULL,
    "risk_pop" INTEGER NOT NULL,
    "sick_pop" INTEGER NOT NULL,
    "trained" INTEGER NOT NULL,
    "risk_to_normal" INTEGER NOT NULL,
    "weight_reduce" REAL NOT NULL,
    "weight_reduce_avg" REAL NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Remission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hoscode" TEXT NOT NULL,
    "hosname" TEXT NOT NULL,
    "hostype" TEXT NOT NULL,
    "tmb_code" TEXT NOT NULL,
    "tmb_name" TEXT NOT NULL,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "trained" INTEGER NOT NULL,
    "ncds_remission" INTEGER NOT NULL,
    "stopped_medication" INTEGER NOT NULL,
    "reduced_1" INTEGER NOT NULL,
    "reduced_2" INTEGER NOT NULL,
    "reduced_3" INTEGER NOT NULL,
    "reduced_4" INTEGER NOT NULL,
    "reduced_5" INTEGER NOT NULL,
    "reduced_6" INTEGER NOT NULL,
    "reduced_7" INTEGER NOT NULL,
    "reduced_8" INTEGER NOT NULL,
    "reduced_n" INTEGER NOT NULL,
    "same_medication" INTEGER NOT NULL,
    "increased_medication" INTEGER NOT NULL,
    "pending_evaluation" INTEGER NOT NULL,
    "lost_followup" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "CarbAmp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "person_target" INTEGER NOT NULL,
    "person_carb" INTEGER NOT NULL,
    "percentage" REAL NOT NULL,
    "person_diff" INTEGER NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RemissionAmp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "trained" INTEGER NOT NULL,
    "ncds_remission" INTEGER NOT NULL,
    "stopped_medication" INTEGER NOT NULL,
    "reduced_1" INTEGER NOT NULL,
    "reduced_2" INTEGER NOT NULL,
    "reduced_3" INTEGER NOT NULL,
    "reduced_4" INTEGER NOT NULL,
    "reduced_5" INTEGER NOT NULL,
    "reduced_6" INTEGER NOT NULL,
    "reduced_7" INTEGER NOT NULL,
    "reduced_8" INTEGER NOT NULL,
    "reduced_n" INTEGER NOT NULL,
    "same_medication" INTEGER NOT NULL,
    "increased_medication" INTEGER NOT NULL,
    "pending_evaluation" INTEGER NOT NULL,
    "lost_followup" INTEGER NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PreventionAmp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "total_volunteers" INTEGER NOT NULL,
    "volunteers_registered" INTEGER NOT NULL,
    "volunteers_percentage" REAL NOT NULL,
    "total_personnel" INTEGER NOT NULL,
    "personnel_registered" INTEGER NOT NULL,
    "personnel_percentage" REAL NOT NULL,
    "service_recipients" INTEGER NOT NULL,
    "normal_population" INTEGER NOT NULL,
    "risk_population" INTEGER NOT NULL,
    "sick_population" INTEGER NOT NULL,
    "risk_trained" INTEGER NOT NULL,
    "risk_to_normal" INTEGER NOT NULL,
    "weight_reduced_0_1" INTEGER NOT NULL,
    "weight_reduced_1_2" INTEGER NOT NULL,
    "weight_reduced_2_3" INTEGER NOT NULL,
    "weight_reduced_3_4" INTEGER NOT NULL,
    "weight_reduced_4_5" INTEGER NOT NULL,
    "weight_reduced_over_5" INTEGER NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Carb_hoscode_key" ON "Carb"("hoscode");

-- CreateIndex
CREATE UNIQUE INDEX "Camp_amp_code_key" ON "Camp"("amp_code");

-- CreateIndex
CREATE UNIQUE INDEX "Chospital_hoscode_key" ON "Chospital"("hoscode");

-- CreateIndex
CREATE INDEX "Chospital_hoscode_idx" ON "Chospital"("hoscode");

-- CreateIndex
CREATE UNIQUE INDEX "Prevention_hoscode_key" ON "Prevention"("hoscode");

-- CreateIndex
CREATE UNIQUE INDEX "Remission_hoscode_key" ON "Remission"("hoscode");

-- CreateIndex
CREATE UNIQUE INDEX "CarbAmp_amp_code_key" ON "CarbAmp"("amp_code");

-- CreateIndex
CREATE UNIQUE INDEX "RemissionAmp_amp_code_key" ON "RemissionAmp"("amp_code");

-- CreateIndex
CREATE UNIQUE INDEX "PreventionAmp_amp_code_key" ON "PreventionAmp"("amp_code");
