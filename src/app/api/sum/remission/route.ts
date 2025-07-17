import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const remissionSums = await prisma.remissionAmp.aggregate({
      _sum: {
        trained: true,
        ncds_remission: true,
        stopped_medication: true,
        reduced_1: true,
        reduced_2: true,
        reduced_3: true,
        reduced_4: true,
        reduced_5: true,
        reduced_6: true,
        reduced_7: true,
        reduced_8: true,
        reduced_n: true,
        same_medication: true,
        increased_medication: true,
        pending_evaluation: true,
        lost_followup: true
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        total_trained: remissionSums._sum.trained || 0,
        total_ncds_remission: remissionSums._sum.ncds_remission || 0,
        total_stopped_medication: remissionSums._sum.stopped_medication || 0,
        total_reduced_1: remissionSums._sum.reduced_1 || 0,
        total_reduced_2: remissionSums._sum.reduced_2 || 0,
        total_reduced_3: remissionSums._sum.reduced_3 || 0,
        total_reduced_4: remissionSums._sum.reduced_4 || 0,
        total_reduced_5: remissionSums._sum.reduced_5 || 0,
        total_reduced_6: remissionSums._sum.reduced_6 || 0,
        total_reduced_7: remissionSums._sum.reduced_7 || 0,
        total_reduced_8: remissionSums._sum.reduced_8 || 0,
        total_reduced_n: remissionSums._sum.reduced_n || 0,
        total_same_medication: remissionSums._sum.same_medication || 0,
        total_increased_medication: remissionSums._sum.increased_medication || 0,
        total_pending_evaluation: remissionSums._sum.pending_evaluation || 0,
        total_lost_followup: remissionSums._sum.lost_followup || 0
      }
    });

  } catch (error) {
    console.error('Error fetching RemissionAmp sums:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch RemissionAmp sums',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
