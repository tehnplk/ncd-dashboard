import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const carbSums = await prisma.carbAmp.aggregate({
      _sum: {
        person_target: true,
        person_carb: true,
        person_diff: true,
        percentage: true
      },
    });

    // Calculate percentage if needed
    const percentage = carbSums._sum.person_target 
      ? (carbSums._sum.person_carb || 0) / carbSums._sum.person_target * 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        total_target: carbSums._sum.person_target || 0,
        total_carb: carbSums._sum.person_carb || 0,
        total_diff: carbSums._sum.person_diff || 0,
        percentage: parseFloat(percentage.toFixed(2)),
      }
    });

  } catch (error) {
    console.error('Error fetching Carb sums:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Carb sums',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
