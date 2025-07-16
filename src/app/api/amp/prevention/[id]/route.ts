import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await prisma.preventionAmp.findUnique({
      where: {
        amp_code: id
      }
    });
    
    if (!result) {
      return NextResponse.json({ error: 'PreventionAmp not found' }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching PreventionAmp:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      total_volunteers,
      volunteers_registered,
      volunteers_percentage,
      total_personnel,
      personnel_registered,
      personnel_percentage,
      service_recipients,
      normal_population,
      risk_population,
      sick_population,
      risk_trained,
      risk_to_normal,
      weight_reduced_0_1,
      weight_reduced_1_2,
      weight_reduced_2_3,
      weight_reduced_3_4,
      weight_reduced_4_5,
      weight_reduced_over_5
    } = body;
    
    const result = await prisma.preventionAmp.update({
      where: {
        amp_code: id
      },
      data: {
        total_volunteers,
        volunteers_registered,
        volunteers_percentage,
        total_personnel,
        personnel_registered,
        personnel_percentage,
        service_recipients,
        normal_population,
        risk_population,
        sick_population,
        risk_trained,
        risk_to_normal,
        weight_reduced_0_1,
        weight_reduced_1_2,
        weight_reduced_2_3,
        weight_reduced_3_4,
        weight_reduced_4_5,
        weight_reduced_over_5,
        updated_at: new Date()
      }
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating PreventionAmp:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}