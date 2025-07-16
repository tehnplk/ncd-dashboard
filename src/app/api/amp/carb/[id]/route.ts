import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await prisma.carbAmp.findUnique({
      where: {
        amp_code: id
      }
    });
    
    if (!result) {
      return NextResponse.json({ error: 'CarbAmp not found' }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching CarbAmp:', error);
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
    const { person_target, person_carb, percentage, person_diff } = body;
    
    const result = await prisma.carbAmp.update({
      where: {
        amp_code: id
      },
      data: {
        person_target,
        person_carb,
        percentage,
        person_diff,
        updated_at: new Date()
      }
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating CarbAmp:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}