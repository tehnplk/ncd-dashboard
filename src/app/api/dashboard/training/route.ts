import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define TypeScript interfaces for the response
interface TrainingData {
  trained: number;
  total: number;
  percentage: number;
  byDistrict: Array<{
    district: string;
    trained: number;
    total: number;
    percentage: number;
  }>;
}

export async function GET() {
  try {
    console.log('Fetching training data...');
    
    // Get training data from Prevention model
    const trainingData = await prisma.prevention.findMany({
      select: {
        amp_name: true,
        trained: true,
        target_pop: true
      },
      orderBy: {
        amp_name: 'asc'
      }
    });

    // Format the training data
    const formattedData = trainingData.map(district => {
      const trained = district.trained || 0;
      const total = district.target_pop || 0;
      const percentage = total > 0 ? parseFloat(((trained / total) * 100).toFixed(1)) : 0;
      
      return {
        district: district.amp_name || 'Unknown',
        trained,
        total,
        percentage
      };
    });

    // Calculate totals
    const totalTrained = formattedData.reduce((sum, d) => sum + d.trained, 0);
    const totalPatients = formattedData.reduce((sum, d) => sum + d.total, 0);
    const totalPercentage = totalPatients > 0 
      ? parseFloat(((totalTrained / totalPatients) * 100).toFixed(1))
      : 0;
    
    // Format the response
    const response: TrainingData = {
      trained: totalTrained,
      total: totalPatients,
      percentage: totalPercentage,
      byDistrict: formattedData
    };

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in /api/dashboard/training:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch training data',
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
