import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const result: any[] = await prisma.$queryRaw`
      SELECT 
        amp_code,
        amp_name,
        SUM(total_officer) as total_officer,
        SUM(total_pop) as total_pop,
        SUM(osm_provider) as osm_provider,
        SUM(officer_provider) as officer_provider,
        SUM(target_pop) as target_pop,
        SUM(prevention_visit) as prevention_visit,
        SUM(normal_pop) as normal_pop,
        SUM(risk_pop) as risk_pop,
        SUM(sick_pop) as sick_pop,
        SUM(trained) as trained,
        SUM(risk_to_normal) as risk_to_normal,
        SUM(weight_reduce) as weight_reduce,
        SUM(weight_reduce_avg) as weight_reduce_avg
      FROM "Prevention"
      GROUP BY amp_code, amp_name
      ORDER BY amp_code
    `;

    const processedResult = result.map((row: any) => {
      const newRow: { [key: string]: any } = {};
      for (const key in row) {
        if (typeof row[key] === 'bigint') {
          newRow[key] = row[key].toString();
        } else {
          newRow[key] = row[key];
        }
      }
      return newRow;
    });
    return NextResponse.json(processedResult);
  } catch (error) {
    console.error('Error in GET /api/prevention/amp:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aggregated prevention data' },
      { status: 500 }
    );
  }
}
