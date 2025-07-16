-- CreateTable
CREATE TABLE "PreventionAmp" (
    "id" SERIAL NOT NULL,
    "amp_code" TEXT NOT NULL,
    "amp_name" TEXT NOT NULL,
    "total_volunteers" INTEGER NOT NULL,
    "volunteers_registered" INTEGER NOT NULL,
    "volunteers_percentage" DOUBLE PRECISION NOT NULL,
    "total_personnel" INTEGER NOT NULL,
    "personnel_registered" INTEGER NOT NULL,
    "personnel_percentage" DOUBLE PRECISION NOT NULL,
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreventionAmp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreventionAmp_amp_code_key" ON "PreventionAmp"("amp_code");
