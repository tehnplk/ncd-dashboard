import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Prevention {
  id: number;
  hoscode: string;
  hosname: string;
  hostype: string;
  tmb_code: string;
  tmb_name: string;
  amp_code: string;
  amp_name: string;
  total_officer: number;
  total_pop: number;
  osm_provider: number;
  officer_provider: number;
  target_pop: number;
  prevention_visit: number;
  normal_pop: number;
  risk_pop: number;
  sick_pop: number;
  trained: number;
  risk_to_normal: number;
  weight_reduce: number;
  weight_reduce_avg: number;
  updated_at: Date;
}

export async function GET() {
  try {
    // Use raw query to avoid TypeScript errors with the Prisma client
    const preventions: Prevention[] = await prisma.$queryRaw`
      SELECT 
        id, 
        hoscode, 
        hosname, 
        hostype, 
        tmb_code, 
        tmb_name, 
        amp_code, 
        amp_name, 
        total_officer, 
        total_pop, 
        osm_provider, 
        officer_provider, 
        target_pop, 
        prevention_visit, 
        normal_pop, 
        risk_pop, 
        sick_pop, 
        trained, 
        risk_to_normal, 
        weight_reduce, 
        weight_reduce_avg, 
        updated_at
      FROM "Prevention"
      ORDER BY updated_at DESC
    `;
    
    return NextResponse.json(preventions);
  } catch (error) {
    console.error('Error in GET /api/prevention:', error);
    return NextResponse.json(
      { error: "Failed to fetch prevention records" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Use raw query to avoid TypeScript errors with the Prisma client
    const newPrevention = await prisma.$queryRaw<Prevention[]>`
      INSERT INTO "Prevention" (
        hoscode, hosname, hostype, tmb_code, tmb_name, amp_code, amp_name,
        total_officer, total_pop, osm_provider, officer_provider, target_pop,
        prevention_visit, normal_pop, risk_pop, sick_pop, trained,
        risk_to_normal, weight_reduce, weight_reduce_avg
      ) VALUES (
        ${data.hoscode}, 
        ${data.hosname || ''}, 
        ${data.hostype || ''}, 
        ${data.tmb_code || ''}, 
        ${data.tmb_name || ''}, 
        ${data.amp_code || ''}, 
        ${data.amp_name || ''},
        ${parseInt(data.total_officer) || 0},
        ${parseInt(data.total_pop) || 0},
        ${parseInt(data.osm_provider) || 0},
        ${parseInt(data.officer_provider) || 0},
        ${parseInt(data.target_pop) || 0},
        ${parseInt(data.prevention_visit) || 0},
        ${parseInt(data.normal_pop) || 0},
        ${parseInt(data.risk_pop) || 0},
        ${parseInt(data.sick_pop) || 0},
        ${parseInt(data.trained) || 0},
        ${parseInt(data.risk_to_normal) || 0},
        ${parseInt(data.weight_reduce) || 0},
        ${parseFloat(data.weight_reduce_avg) || 0}
      )
      RETURNING *
    `;
    
    return NextResponse.json(newPrevention[0], { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/prevention:', error);
    return NextResponse.json(
      { error: "Failed to create prevention record" },
      { status: 500 }
    );
  }
}