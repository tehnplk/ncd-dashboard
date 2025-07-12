import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define TypeScript interfaces for the response
interface ScreeningResponse {
  counts: {
    normal: number;
    risk: number;
    sick: number;
    total: number;
  };
  percentages: {
    normal: number;
    risk: number;
    sick: number;
    screened: number; // Percentage of target population screened
  };
  byDistrict: Array<{
    district: string;
    normal: number;
    risk: number;
    sick: number;
    total: number;
    percentage: number;
  }>;
}

export async function GET() {
  try {
    console.log('Fetching screening data...');
    
    // Get prevention data grouped by district
    const preventionData = await prisma.prevention.findMany({
      select: {
        amp_name: true,
        normal_pop: true,
        risk_pop: true,
        sick_pop: true,
        target_pop: true
      },
      orderBy: {
        amp_name: 'asc'
      }
    });

    // Calculate totals
    const totalNormal = preventionData.reduce((sum, item) => sum + (item.normal_pop || 0), 0);
    const totalRisk = preventionData.reduce((sum, item) => sum + (item.risk_pop || 0), 0);
    const totalSick = preventionData.reduce((sum, item) => sum + (item.sick_pop || 0), 0);
    const totalScreened = totalNormal + totalRisk + totalSick;
    const totalTarget = preventionData.reduce((sum, item) => sum + (item.target_pop || 0), 1); // Avoid division by zero
    
    // Calculate percentages
    const screenedPercentage = (totalScreened / totalTarget) * 100;
    
    // Format district data
    const byDistrict = preventionData.map(district => {
      const districtTotal = (district.normal_pop || 0) + (district.risk_pop || 0) + (district.sick_pop || 0);
      const districtPercentage = district.target_pop 
        ? (districtTotal / district.target_pop) * 100 
        : 0;
      
      return {
        district: district.amp_name || 'Unknown',
        normal: district.normal_pop || 0,
        risk: district.risk_pop || 0,
        sick: district.sick_pop || 0,
        total: districtTotal,
        percentage: parseFloat(districtPercentage.toFixed(1))
      };
    });
    
    // Format the response
    const response: ScreeningResponse = {
      counts: {
        normal: totalNormal,
        risk: totalRisk,
        sick: totalSick,
        total: totalScreened
      },
      percentages: {
        normal: totalScreened > 0 ? parseFloat(((totalNormal / totalScreened) * 100).toFixed(1)) : 0,
        risk: totalScreened > 0 ? parseFloat(((totalRisk / totalScreened) * 100).toFixed(1)) : 0,
        sick: totalScreened > 0 ? parseFloat(((totalSick / totalScreened) * 100).toFixed(1)) : 0,
        screened: parseFloat(screenedPercentage.toFixed(1))
      },
      byDistrict
    };

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in /api/dashboard/screening:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch screening data',
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
