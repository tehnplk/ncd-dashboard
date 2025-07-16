import { PrismaClient } from '@prisma/client'
import ampData from './amp.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Seed CarbAmp table
  console.log('📊 Seeding CarbAmp table...')
  for (const amp of ampData) {
    await prisma.carbAmp.upsert({
      where: { amp_code: amp.amp_code },
      update: {},
      create: {
        amp_code: amp.amp_code,
        amp_name: amp.amp_name,
        person_target: 0,
        person_carb: 0,
        percentage: 0.0,
        person_diff: 0,
      },
    })
  }
  console.log(`✅ Created ${ampData.length} CarbAmp records`)

  // Seed PreventionAmp table
  console.log('🏥 Seeding PreventionAmp table...')
  for (const amp of ampData) {
    await prisma.preventionAmp.upsert({
      where: { amp_code: amp.amp_code },
      update: {},
      create: {
        amp_code: amp.amp_code,
        amp_name: amp.amp_name,
        total_volunteers: 0,
        volunteers_registered: 0,
        volunteers_percentage: 0.0,
        total_personnel: 0,
        personnel_registered: 0,
        personnel_percentage: 0.0,
        service_recipients: 0,
        normal_population: 0,
        risk_population: 0,
        sick_population: 0,
        risk_trained: 0,
        risk_to_normal: 0,
        weight_reduced_0_1: 0,
        weight_reduced_1_2: 0,
        weight_reduced_2_3: 0,
        weight_reduced_3_4: 0,
        weight_reduced_4_5: 0,
        weight_reduced_over_5: 0,
      },
    })
  }
  console.log(`✅ Created ${ampData.length} PreventionAmp records`)

  // Seed RemissionAmp table
  console.log('💊 Seeding RemissionAmp table...')
  for (const amp of ampData) {
    await prisma.remissionAmp.upsert({
      where: { amp_code: amp.amp_code },
      update: {},
      create: {
        amp_code: amp.amp_code,
        amp_name: amp.amp_name,
        trained: 0,
        ncds_remission: 0,
        stopped_medication: 0,
        reduced_1: 0,
        reduced_2: 0,
        reduced_3: 0,
        reduced_4: 0,
        reduced_5: 0,
        reduced_6: 0,
        reduced_7: 0,
        reduced_8: 0,
        reduced_n: 0,
        same_medication: 0,
        increased_medication: 0,
        pending_evaluation: 0,
        lost_followup: 0,
      },
    })
  }
  console.log(`✅ Created ${ampData.length} RemissionAmp records`)

  console.log('🎉 Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })