import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

interface DashboardSummary {
  carbPercentage: number;
  screenedPercentage: number;
  normalCount: number;
  riskCount: number;
  sickCount: number;
  trainedCount: number;
  trainedPercentage: number;
  recoveredCount: number;
  totalWeightLoss: number;
  avgWeightLoss: number;
  stoppedMedication: number;
}

export async function GET() {
  try {
    console.log('Fetching dashboard summary data...');
    
    // Fetch carb data
    const carbData = await prisma.$queryRaw<Array<{percentage: number}>>`
      SELECT 
        ROUND(((COALESCE(SUM(person_carb), 0) * 100.0) / 
        NULLIF(SUM(person_target), 0))::numeric, 2) as percentage
      FROM "Carb";
    `;

    // Fetch screening data (example - adjust based on your schema)
    const screeningData = await prisma.$queryRaw<Array<{
      normal_count: number;
      risk_count: number;
      sick_count: number;
      total_screened: number;
    }>>`
      SELECT 
        COUNT(CASE WHEN status = 'normal' THEN 1 END) as normal_count,
        COUNT(CASE WHEN status = 'risk' THEN 1 END) as risk_count,
        COUNT(CASE WHEN status = 'sick' THEN 1 END) as sick_count,
        COUNT(*) as total_screened
      FROM "Screening";
    `;

    // Process the data into the required format
    const response: DashboardSummary = {
      carbPercentage: carbData[0]?.percentage || 0,
      screenedPercentage: screeningData[0]?.total_screened > 0 
        ? Math.round((screeningData[0].total_screened / 10000) * 100 * 10) / 10 // Example calculation
        : 0,
      normalCount: screeningData[0]?.normal_count || 0,
      riskCount: screeningData[0]?.risk_count || 0,
      sickCount: screeningData[0]?.sick_count || 0,
      trainedCount: 0, // Will be implemented
      trainedPercentage: 0, // Will be implemented
      recoveredCount: 0, // Will be implemented
      totalWeightLoss: 0, // Will be implemented
      avgWeightLoss: 0, // Will be implemented
      stoppedMedication: 0, // Will be implemented
    };

    console.log('Dashboard summary data fetched successfully');
    
    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching dashboard summary data:', errorMessage);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch dashboard summary data',
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
