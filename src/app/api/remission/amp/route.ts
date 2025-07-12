import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Fetching aggregated remission data by amphur...');
    // Define the type for the raw query result
    interface AmpRemissionResult {
      amp_code: string;
      amp_name: string;
      trained: number | bigint;
      ncds_remission: number | bigint;
      stopped_medication: number | bigint;
      reduced_1: number | bigint;
      reduced_2: number | bigint;
      reduced_3: number | bigint;
      reduced_4: number | bigint;
      reduced_5: number | bigint;
      reduced_6: number | bigint;
      reduced_7: number | bigint;
      reduced_8: number | bigint;
      reduced_n: number | bigint;
      same_medication: number | bigint;
      increased_medication: number | bigint;
      pending_evaluation: number | bigint;
      lost_followup: number | bigint;
    }

    const rawResult = await prisma.$queryRaw<AmpRemissionResult[]>`
      SELECT 
        amp_code,
        amp_name,
        COALESCE(SUM(trained), 0) as trained,
        COALESCE(SUM(ncds_remission), 0) as ncds_remission,
        COALESCE(SUM(stopped_medication), 0) as stopped_medication,
        COALESCE(SUM(reduced_1), 0) as reduced_1,
        COALESCE(SUM(reduced_2), 0) as reduced_2,
        COALESCE(SUM(reduced_3), 0) as reduced_3,
        COALESCE(SUM(reduced_4), 0) as reduced_4,
        COALESCE(SUM(reduced_5), 0) as reduced_5,
        COALESCE(SUM(reduced_6), 0) as reduced_6,
        COALESCE(SUM(reduced_7), 0) as reduced_7,
        COALESCE(SUM(reduced_8), 0) as reduced_8,
        COALESCE(SUM(reduced_n), 0) as reduced_n,
        COALESCE(SUM(same_medication), 0) as same_medication,
        COALESCE(SUM(increased_medication), 0) as increased_medication,
        COALESCE(SUM(pending_evaluation), 0) as pending_evaluation,
        COALESCE(SUM(lost_followup), 0) as lost_followup
      FROM "Remission"
      GROUP BY amp_code, amp_name
      ORDER BY amp_code
    `;

    // Convert BigInt values to numbers
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

    console.log('Successfully fetched and processed aggregated remission data');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/remission/amp:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch remission data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}