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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const id = parseInt(resolvedParams.id);
  try {
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
      WHERE id = ${id}
    `;

    if (!preventions || preventions.length === 0) {
      return NextResponse.json(
        { error: 'Prevention record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(preventions[0]);
  } catch (error) {
    console.error('Error in GET /api/prevention/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prevention record' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    
    const updatedPreventions = await prisma.$queryRaw<Prevention[]>`
      UPDATE "Prevention"
      SET 
        total_officer = ${parseInt(body.total_officer) || 0},
        total_pop = ${parseInt(body.total_pop) || 0},
        osm_provider = ${parseInt(body.osm_provider) || 0},
        officer_provider = ${parseInt(body.officer_provider) || 0},
        target_pop = ${parseInt(body.target_pop) || 0},
        prevention_visit = ${parseInt(body.prevention_visit) || 0},
        normal_pop = ${parseInt(body.normal_pop) || 0},
        risk_pop = ${parseInt(body.risk_pop) || 0},
        sick_pop = ${parseInt(body.sick_pop) || 0},
        trained = ${parseInt(body.trained) || 0},
        risk_to_normal = ${parseInt(body.risk_to_normal) || 0},
        weight_reduce = ${parseInt(body.weight_reduce) || 0},
        weight_reduce_avg = ${parseFloat(body.weight_reduce_avg) || 0},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedPreventions || updatedPreventions.length === 0) {
      return NextResponse.json(
        { error: 'Prevention record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPreventions[0]);
  } catch (error) {
    console.error('Error in PUT /api/prevention/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update prevention record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id);
    const result = await prisma.$executeRaw`
      DELETE FROM "Prevention"
      WHERE id = ${id}
    `;

    if (result === 0) {
      return NextResponse.json(
        { error: 'Prevention record not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in DELETE /api/prevention/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete prevention record' },
      { status: 500 }
    );
  }
}