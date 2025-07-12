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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await prisma.remission.findUnique({
      where: { id: Number(id) },
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Remission record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error in GET /api/remission/hos/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch remission record' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data: Remission = await request.json();

    const updatedRemission = await prisma.remission.update({
      where: { id: Number(id) },
      data: {
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
    });

    return NextResponse.json(updatedRemission);
  } catch (error) {
    console.error(`Error in PUT /api/remission/hos/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update remission record' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.remission.delete({
      where: { id: Number(id) },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Error in DELETE /api/remission/hos/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete remission record' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}