import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export async function GET() {
  try {
    // Aggregate sums from preventionAmp model
    const preventionSums = await prisma.preventionAmp.aggregate({
      _sum: {
        total_volunteers: true,
        volunteers_registered: true,
        total_personnel: true,
        personnel_registered: true,
        service_recipients: true,
        normal_population: true,
        risk_population: true,
        sick_population: true,
        risk_trained: true,
        risk_to_normal: true,
        weight_reduced_0_1: true,
        weight_reduced_1_2: true,
        weight_reduced_2_3: true,
        weight_reduced_3_4: true,
        weight_reduced_4_5: true,
        weight_reduced_over_5: true,
      },
    });

    // Calculate percentages
    const volunteersPercentage = preventionSums._sum.total_volunteers
      ? (preventionSums._sum.volunteers_registered || 0) / preventionSums._sum.total_volunteers * 100
      : 0;
      
    const personnelPercentage = preventionSums._sum.total_personnel
      ? (preventionSums._sum.personnel_registered || 0) / preventionSums._sum.total_personnel * 100
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        total_volunteers: preventionSums._sum.total_volunteers || 0,
        volunteers_registered: preventionSums._sum.volunteers_registered || 0,
        volunteers_percentage: parseFloat(volunteersPercentage.toFixed(2)),
        total_personnel: preventionSums._sum.total_personnel || 0,
        personnel_registered: preventionSums._sum.personnel_registered || 0,
        personnel_percentage: parseFloat(personnelPercentage.toFixed(2)),
        service_recipients: preventionSums._sum.service_recipients || 0,
        normal_population: preventionSums._sum.normal_population || 0,
        risk_population: preventionSums._sum.risk_population || 0,
        sick_population: preventionSums._sum.sick_population || 0,
        risk_trained: preventionSums._sum.risk_trained || 0,
        risk_to_normal: preventionSums._sum.risk_to_normal || 0,
        weight_reduced_0_1: preventionSums._sum.weight_reduced_0_1 || 0,
        weight_reduced_1_2: preventionSums._sum.weight_reduced_1_2 || 0,
        weight_reduced_2_3: preventionSums._sum.weight_reduced_2_3 || 0,
        weight_reduced_3_4: preventionSums._sum.weight_reduced_3_4 || 0,
        weight_reduced_4_5: preventionSums._sum.weight_reduced_4_5 || 0,
        weight_reduced_over_5: preventionSums._sum.weight_reduced_over_5 || 0,
      }
    });

  } catch (error) {
    console.error('Error fetching PreventionAmp sums:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch PreventionAmp sums',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
