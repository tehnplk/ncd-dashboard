-- CreateTable
CREATE TABLE "Carb" (
    "id" SERIAL NOT NULL,
    "hoscode" TEXT NOT NULL,
    "hosname" TEXT NOT NULL,
    "hostype" TEXT NOT NULL,
    "tmb_code" TEXT NOT NULL,
    "tmb_name" TEXT NOT NULL,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "person_target" DOUBLE PRECISION NOT NULL,
    "person_carb" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "person_diff" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Carb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camp" (
    "id" SERIAL NOT NULL,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Camp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chospital" (
    "id" SERIAL NOT NULL,
    "hoscode" TEXT NOT NULL,
    "hosname" TEXT NOT NULL,
    "hostype" TEXT NOT NULL,
    "tmb_code" TEXT NOT NULL,
    "tmb_name" TEXT NOT NULL,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "flag_activate" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prevention" (
    "id" SERIAL NOT NULL,
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
    "weight_reduce" DOUBLE PRECISION NOT NULL,
    "weight_reduce_avg" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prevention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Remission" (
    "id" SERIAL NOT NULL,
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
    "lost_followup" INTEGER NOT NULL,

    CONSTRAINT "Remission_pkey" PRIMARY KEY ("id")
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
