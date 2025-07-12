import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {

    const result = await prisma.$queryRaw`
    SELECT 
        c.amp_code,
        c.amp_name,
        COALESCE(SUM(c.person_target), 0) as person_target,
        COALESCE(SUM(c.person_carb), 0) as person_carb,
        CASE 
          WHEN COALESCE(SUM(c.person_target), 0) = 0 THEN 0
          ELSE ROUND(((COALESCE(SUM(c.person_carb), 0) * 100.0) / NULLIF(SUM(c.person_target), 0))::numeric, 2)
        END as percentage
      FROM 
        "Carb" c
      GROUP BY 
        c.amp_code, c.amp_name
      ORDER BY 
        percentage DESC;
    `;
    return NextResponse.json(result);
}