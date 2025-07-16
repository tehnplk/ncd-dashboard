import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Use raw SQL query to avoid Prisma client caching issues
    const result = await prisma.$queryRaw`
      SELECT * FROM "PreventionAmp" ORDER BY amp_code ASC
    `;
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching PreventionAmp data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}