import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Remission {
  id?: number;
  hoscode: string;
  hosname: string;
  hostype: string;
  tmb_code: string;
  tmb_name: string;
  amp_code: string;
  amp_name: string;
  trained: number;
  ncds_remission: number;
  stopped_medication: number;
  reduced_1: number;
  reduced_2: number;
  reduced_3: number;
  reduced_4: number;
  reduced_5: number;
  reduced_6: number;
  reduced_7: number;
  reduced_8: number;
  reduced_n: number;
  same_medication: number;
  increased_medication: number;
  pending_evaluation: number;
  lost_followup: number;
}

export async function GET() {
  try {
    console.log('Fetching remission data...');
    
    // First get the raw data
    const rawResult = await prisma.remission.findMany({
      orderBy: { hoscode: 'asc' },
    });
    
    // Convert any BigInt values to numbers
    const result = rawResult.map(item => ({
      ...item,
      trained: Number(item.trained),
      ncds_remission: Number(item.ncds_remission),
      stopped_medication: Number(item.stopped_medication),
      reduced_1: Number(item.reduced_1),
      reduced_2: Number(item.reduced_2),
      reduced_3: Number(item.reduced_3),
      reduced_4: Number(item.reduced_4),
      reduced_5: Number(item.reduced_5),
      reduced_6: Number(item.reduced_6),
      reduced_7: Number(item.reduced_7),
      reduced_8: Number(item.reduced_8),
      reduced_n: Number(item.reduced_n),
      same_medication: Number(item.same_medication),
      increased_medication: Number(item.increased_medication),
      pending_evaluation: Number(item.pending_evaluation),
      lost_followup: Number(item.lost_followup)
    }));
    
    console.log(`Successfully fetched and processed ${result.length} remission records`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/remission/hos:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch remission data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data: Remission = await request.json();
    
    // Create or update the remission record
    const result = await prisma.remission.upsert({
      where: { hoscode: data.hoscode },
      update: {
        hosname: data.hosname,
        hostype: data.hostype,
        tmb_code: data.tmb_code,
        tmb_name: data.tmb_name,
        amp_code: data.amp_code,
        amp_name: data.amp_name,
        trained: data.trained,
        ncds_remission: data.ncds_remission,
        stopped_medication: data.stopped_medication,
        reduced_1: data.reduced_1,
        reduced_2: data.reduced_2,
        reduced_3: data.reduced_3,
        reduced_4: data.reduced_4,
        reduced_5: data.reduced_5,
        reduced_6: data.reduced_6,
        reduced_7: data.reduced_7,
        reduced_8: data.reduced_8,
        reduced_n: data.reduced_n,
        same_medication: data.same_medication,
        increased_medication: data.increased_medication,
        pending_evaluation: data.pending_evaluation,
        lost_followup: data.lost_followup,
      },
      create: {
        hoscode: data.hoscode,
        hosname: data.hosname,
        hostype: data.hostype,
        tmb_code: data.tmb_code,
        tmb_name: data.tmb_name,
        amp_code: data.amp_code,
        amp_name: data.amp_name,
        trained: data.trained || 0,
        ncds_remission: data.ncds_remission || 0,
        stopped_medication: data.stopped_medication || 0,
        reduced_1: data.reduced_1 || 0,
        reduced_2: data.reduced_2 || 0,
        reduced_3: data.reduced_3 || 0,
        reduced_4: data.reduced_4 || 0,
        reduced_5: data.reduced_5 || 0,
        reduced_6: data.reduced_6 || 0,
        reduced_7: data.reduced_7 || 0,
        reduced_8: data.reduced_8 || 0,
        reduced_n: data.reduced_n || 0,
        same_medication: data.same_medication || 0,
        increased_medication: data.increased_medication || 0,
        pending_evaluation: data.pending_evaluation || 0,
        lost_followup: data.lost_followup || 0,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/remission/hos:', error);
    return NextResponse.json(
      { error: 'Failed to save remission data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}