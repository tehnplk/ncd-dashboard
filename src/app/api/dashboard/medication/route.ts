import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define TypeScript interfaces for the response
interface ReductionData {
  reductionLevel: string;
  count: number;
  percentage: number;
}

interface MedicationData {
  totalPatients: number;
  byReductionLevel: ReductionData[];
  summary: {
    // Raw counts
    reduced: number[];  // Index 0-7 for reduced_1 to reduced_8
    reducedN: number;   // For reduced_n (more than 8)
    same: number;       // same_medication
    increased: number;  // increased_medication
    stopped: number;    // stopped_medication
    pending: number;    // pending_evaluation
    lost: number;       // lost_followup
    
    // Totals
    totalReduced: number;
    totalNoChange: number;
    totalIncreased: number;
    totalStopped: number;
    totalPending: number;
    totalLost: number;
    
    // Percentages
    reducedPercentages: number[];
    reducedNPercentage: number;
    samePercentage: number;
    increasedPercentage: number;
    stoppedPercentage: number;
    pendingPercentage: number;
    lostPercentage: number;
  };
}

export async function GET() {
  try {
    console.log('Fetching medication reduction data...');
    
    // Get medication data from Remission model
    const result = await prisma.remission.aggregate({
      _sum: {
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
        stopped_medication: true,
        pending_evaluation: true,
        lost_followup: true,
      }
    });

    // Extract sums from the result
    const sums = result._sum;
    
    // Calculate reduction levels
    const reducedCounts = [
      sums.reduced_1 || 0,
      sums.reduced_2 || 0,
      sums.reduced_3 || 0,
      sums.reduced_4 || 0,
      sums.reduced_5 || 0,
      sums.reduced_6 || 0,
      sums.reduced_7 || 0,
      sums.reduced_8 || 0
    ];
    
    const reducedN = sums.reduced_n || 0;
    const sameMedication = sums.same_medication || 0;
    const increasedMedication = sums.increased_medication || 0;
    const stoppedMedication = sums.stopped_medication || 0;
    const pendingEvaluation = sums.pending_evaluation || 0;
    const lostFollowup = sums.lost_followup || 0;
    
    // Calculate totals
    const totalReduced = reducedCounts.reduce((sum, val) => sum + val, 0) + reducedN;
    const totalPatients = [
      ...reducedCounts,
      reducedN,
      sameMedication,
      increasedMedication,
      stoppedMedication,
      pendingEvaluation,
      lostFollowup
    ].reduce((sum, val) => sum + val, 0);
    
    // Format reduction levels data
    const byReductionLevel: ReductionData[] = [
      ...reducedCounts.map((count, index) => ({
        reductionLevel: `reduced_${index + 1}`,
        count,
        percentage: totalPatients > 0 ? parseFloat(((count / totalPatients) * 100).toFixed(1)) : 0
      })),
      {
        reductionLevel: 'reduced_n',
        count: reducedN,
        percentage: totalPatients > 0 ? parseFloat(((reducedN / totalPatients) * 100).toFixed(1)) : 0
      },
      {
        reductionLevel: 'same_medication',
        count: sameMedication,
        percentage: totalPatients > 0 ? parseFloat(((sameMedication / totalPatients) * 100).toFixed(1)) : 0
      },
      {
        reductionLevel: 'increased_medication',
        count: increasedMedication,
        percentage: totalPatients > 0 ? parseFloat(((increasedMedication / totalPatients) * 100).toFixed(1)) : 0
      },
      {
        reductionLevel: 'stopped_medication',
        count: stoppedMedication,
        percentage: totalPatients > 0 ? parseFloat(((stoppedMedication / totalPatients) * 100).toFixed(1)) : 0
      },
      {
        reductionLevel: 'pending_evaluation',
        count: pendingEvaluation,
        percentage: totalPatients > 0 ? parseFloat(((pendingEvaluation / totalPatients) * 100).toFixed(1)) : 0
      },
      {
        reductionLevel: 'lost_followup',
        count: lostFollowup,
        percentage: totalPatients > 0 ? parseFloat(((lostFollowup / totalPatients) * 100).toFixed(1)) : 0
      }
    ];
    
    // Calculate percentages
    const reducedPercentages = reducedCounts.map(count => 
      totalPatients > 0 ? parseFloat(((count / totalPatients) * 100).toFixed(1)) : 0
    );
    
    // Format the response
    const response: MedicationData = {
      totalPatients,
      byReductionLevel,
      summary: {
        // Raw counts
        reduced: reducedCounts,
        reducedN,
        same: sameMedication,
        increased: increasedMedication,
        stopped: stoppedMedication,
        pending: pendingEvaluation,
        lost: lostFollowup,
        
        // Totals
        totalReduced,
        totalNoChange: sameMedication,
        totalIncreased: increasedMedication,
        totalStopped: stoppedMedication,
        totalPending: pendingEvaluation,
        totalLost: lostFollowup,
        
        // Percentages
        reducedPercentages,
        reducedNPercentage: totalPatients > 0 ? parseFloat(((reducedN / totalPatients) * 100).toFixed(1)) : 0,
        samePercentage: totalPatients > 0 ? parseFloat(((sameMedication / totalPatients) * 100).toFixed(1)) : 0,
        increasedPercentage: totalPatients > 0 ? parseFloat(((increasedMedication / totalPatients) * 100).toFixed(1)) : 0,
        stoppedPercentage: totalPatients > 0 ? parseFloat(((stoppedMedication / totalPatients) * 100).toFixed(1)) : 0,
        pendingPercentage: totalPatients > 0 ? parseFloat(((pendingEvaluation / totalPatients) * 100).toFixed(1)) : 0,
        lostPercentage: totalPatients > 0 ? parseFloat(((lostFollowup / totalPatients) * 100).toFixed(1)) : 0
      }
    };

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching medication data:', errorMessage);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch medication data',
        details: process.env.NODE_ENV !== 'production' ? errorMessage : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
    
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('Error disconnecting from database:', e);
    }
  }
}
