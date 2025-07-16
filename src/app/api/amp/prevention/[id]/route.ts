import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Use raw SQL query to avoid Prisma client caching issues
    const result = await prisma.$queryRaw`
      SELECT * FROM "PreventionAmp" WHERE amp_code = ${id}
    `;
    
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json({ error: 'PreventionAmp not found' }, { status: 404 });
    }
    
    return NextResponse.json(Array.isArray(result) ? result[0] : result);
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
    
    // Use raw SQL query to update the record
    const result = await prisma.$executeRaw`
      UPDATE "PreventionAmp"
      SET 
        total_volunteers = ${total_volunteers},
        volunteers_registered = ${volunteers_registered},
        volunteers_percentage = ${volunteers_percentage},
        total_personnel = ${total_personnel},
        personnel_registered = ${personnel_registered},
        personnel_percentage = ${personnel_percentage},
        service_recipients = ${service_recipients},
        normal_population = ${normal_population},
        risk_population = ${risk_population},
        sick_population = ${sick_population},
        risk_trained = ${risk_trained},
        risk_to_normal = ${risk_to_normal},
        weight_reduced_0_1 = ${weight_reduced_0_1},
        weight_reduced_1_2 = ${weight_reduced_1_2},
        weight_reduced_2_3 = ${weight_reduced_2_3},
        weight_reduced_3_4 = ${weight_reduced_3_4},
        weight_reduced_4_5 = ${weight_reduced_4_5},
        weight_reduced_over_5 = ${weight_reduced_over_5},
        updated_at = NOW()
      WHERE amp_code = ${id}
    `;
    
    // Fetch the updated record
    const updatedRecord = await prisma.$queryRaw`
      SELECT * FROM "PreventionAmp" WHERE amp_code = ${id}
    `;
    
    return NextResponse.json(Array.isArray(updatedRecord) ? updatedRecord[0] : updatedRecord);
  } catch (error) {
    console.error('Error updating PreventionAmp:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}