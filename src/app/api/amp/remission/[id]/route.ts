import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await prisma.remissionAmp.findUnique({
      where: {
        amp_code: id
      }
    });
    
    if (!result) {
      return NextResponse.json({ error: 'RemissionAmp not found' }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching RemissionAmp:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json();
    const {
      trained,
      ncds_remission,
      stopped_medication,
      reduced_1,
      reduced_2,
      reduced_3,
      reduced_4,
      reduced_5,
      reduced_6,
      reduced_7,
      reduced_8,
      reduced_n,
      same_medication,
      increased_medication,
      pending_evaluation,
      lost_followup
    } = body;
    
    const result = await prisma.remissionAmp.update({
      where: {
        amp_code: id
      },
      data: {
        trained,
        ncds_remission,
        stopped_medication,
        reduced_1,
        reduced_2,
        reduced_3,
        reduced_4,
        reduced_5,
        reduced_6,
        reduced_7,
        reduced_8,
        reduced_n,
        same_medication,
        increased_medication,
        pending_evaluation,
        lost_followup,
        updated_at: new Date()
      }
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating RemissionAmp:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}