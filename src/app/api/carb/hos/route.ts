import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const carbs = await prisma.carb.findMany({
      select: {
        id: true,
        hoscode: true,
        hosname: true,
        hostype: true,
        tmb_code: true,
        tmb_name: true,
        amp_code: true,
        amp_name: true,
        person_target: true,
        person_carb: true,
        percentage: true,
        person_diff: true,
        updated_at: true
      },
      orderBy: {
        updated_at: 'desc'
      }
    });
    return NextResponse.json(carbs);
  } catch (error) {
    console.error('Error in GET /api/carb:', error);
    return NextResponse.json(
      { error: "Failed to fetch carb records" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const carb = await prisma.carb.create({
      data: {
        hoscode: body.hoscode,
        hosname: body.hosname,
        hostype: body.hostype,
        tmb_code: body.tmb_code,
        tmb_name: body.tmb_name,
        amp_code: body.amp_code,
        amp_name: body.amp_name,
        person_target: body.person_target || 0,
        person_carb: body.person_carb || 0,
        percentage: body.percentage || 0,
        person_diff: body.person_diff || 0,
        updated_at: new Date()
      }
    });
    
    return NextResponse.json(carb, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create carb record" },
      { status: 500 }
    );
  }
}
