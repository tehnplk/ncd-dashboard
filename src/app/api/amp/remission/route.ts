import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const result = await prisma.remissionAmp.findMany({
      orderBy: {
        amp_code: 'asc'
      }
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching RemissionAmp data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}