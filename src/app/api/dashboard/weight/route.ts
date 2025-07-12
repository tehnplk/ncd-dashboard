import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define TypeScript interfaces for the response
interface WeightData {
  totalLoss: number;
  avgLoss: number;
  patientCount: number;
  byDistrict: Array<{
    district: string;
    totalLoss: number;
    avgLoss: number;
    patientCount: number;
  }>;
}

export async function GET() {
  try {
    console.log('Fetching weight loss data...');
    
    // Get weight data from Prevention model
    const weightData = await prisma.prevention.findMany({
      select: {
        amp_name: true,
        weight_reduce: true,      // Total weight reduced
        weight_reduce_avg: true,  // Average weight reduced per person
        // Using risk_pop as an estimate for patient count
        // Adjust this based on your actual data model
        risk_pop: true
      },
      orderBy: {
        amp_name: 'asc'
      }
    });

    // Format the weight data
    const formattedData = weightData.map(district => {
      const totalLoss = district.weight_reduce || 0;
      const avgLoss = district.weight_reduce_avg || 0;
      // Using risk_pop as a proxy for patient count
      // Adjust this based on your actual data model
      const patientCount = Math.round(totalLoss / (avgLoss || 1)) || 0;
      
      return {
        district: district.amp_name || 'Unknown',
        totalLoss: parseFloat(totalLoss.toFixed(1)),
        avgLoss: parseFloat(avgLoss.toFixed(1)),
        patientCount
      };
    });

    // Calculate totals
    const totalPatientCount = formattedData.reduce((sum, d) => sum + d.patientCount, 0);
    const totalWeightLoss = parseFloat(formattedData
      .reduce((sum, d) => sum + d.totalLoss, 0)
      .toFixed(1));
    const avgWeightLoss = totalPatientCount > 0 
      ? parseFloat((totalWeightLoss / totalPatientCount).toFixed(1))
      : 0;
    
    // Format the response
    const response: WeightData = {
      totalLoss: totalWeightLoss,
      avgLoss: avgWeightLoss,
      patientCount: totalPatientCount,
      byDistrict: formattedData
    };

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching weight data:', errorMessage);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch weight data',
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
