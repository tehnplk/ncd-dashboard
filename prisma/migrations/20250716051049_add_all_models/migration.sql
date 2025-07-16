-- CreateTable
CREATE TABLE "CarbAmp" (
    "id" SERIAL NOT NULL,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "person_target" DOUBLE PRECISION NOT NULL,
    "person_carb" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "person_diff" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarbAmp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventionAmp" (
    "id" SERIAL NOT NULL,
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
    "weight_reduce" DOUBLE PRECISION NOT NULL,
    "weight_reduce_avg" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreventionAmp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemissionAmp" (
    "id" SERIAL NOT NULL,
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RemissionAmp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarbAmp_amp_code_key" ON "CarbAmp"("amp_code");

-- CreateIndex
CREATE UNIQUE INDEX "PreventionAmp_amp_code_key" ON "PreventionAmp"("amp_code");

-- CreateIndex
CREATE UNIQUE INDEX "RemissionAmp_amp_code_key" ON "RemissionAmp"("amp_code");
