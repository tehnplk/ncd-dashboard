import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    // Read the hos.json file
    const hosData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'hos.json'), 'utf-8')
    );

    // Filter out type 15 and 16
    const filteredHosData = hosData.filter(
      (hos: any) => hos.hostype !== '15' && hos.hostype !== '16'
    );

    console.log(`Found ${filteredHosData.length} hospitals to process`);

    // Initialize Carb data
    const carbData = filteredHosData.map((hos: any) => ({
      hoscode: hos.hoscode,
      hosname: hos.hosname,
      hostype: hos.hostype,
      tmb_code: hos.tmb_code,
      tmb_name: hos.tmb_name,
      amp_code: hos.amp_code,
      amp_name: hos.amp_name,
      person_target: 0,
      person_carb: 0,
      percentage: 0,
      person_diff: 0,
    }));

    // Initialize Prevention data
    const preventionData = filteredHosData.map((hos: any) => ({
      hoscode: hos.hoscode,
      hosname: hos.hosname,
      hostype: hos.hostype,
      tmb_code: hos.tmb_code,
      tmb_name: hos.tmb_name,
      amp_code: hos.amp_code,
      amp_name: hos.amp_name,
      total_officer: 0,
      total_pop: 0,
      osm_provider: 0,
      officer_provider: 0,
      target_pop: 0,
      prevention_visit: 0,
      normal_pop: 0,
      risk_pop: 0,
      sick_pop: 0,
      trained: 0,
      risk_to_normal: 0,
      weight_reduce: 0,
      weight_reduce_avg: 0,
    }));

    // Initialize Remission data
    const remissionData = filteredHosData.map((hos: any) => ({
      hoscode: hos.hoscode,
      hosname: hos.hosname,
      hostype: hos.hostype,
      tmb_code: hos.tmb_code,
      tmb_name: hos.tmb_name,
      amp_code: hos.amp_code,
      amp_name: hos.amp_name,
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
    }));

    // Use transactions to ensure all operations succeed or fail together
    await prisma.$transaction([
      // Delete existing data
      prisma.carb.deleteMany({}),
      prisma.prevention.deleteMany({}),
      prisma.remission.deleteMany({}),
      
      // Insert new data
      prisma.carb.createMany({
        data: carbData,
        skipDuplicates: true,
      }),
      prisma.prevention.createMany({
        data: preventionData,
        skipDuplicates: true,
      }),
      prisma.remission.createMany({
        data: remissionData,
        skipDuplicates: true,
      }),
    ]);

    console.log('Data initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
