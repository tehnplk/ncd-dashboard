import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define TypeScript interfaces for the response
interface DistrictCarbData {
  code: string;
  name: string;
  target: number;
  carb: number;
  percentage: number;
}

interface CarbResponse {
  districts: DistrictCarbData[];
  summary: {
    totalTarget: number;
    totalCarb: number;
    overallPercentage: number;
    districtCount: number;
  };
}

export async function GET() {
  try {
    console.log('Fetching carb data...');
    
    // Get carb data grouped by district using Prisma's groupBy
    const districtData = await prisma.carb.groupBy({
      by: ['amp_code', 'amp_name'],
      _sum: {
        person_target: true,
        person_carb: true,
      },
      orderBy: {
        amp_name: 'asc'
      }
    });

    // Format the district data
    const formattedDistricts = districtData.map(district => {
      const target = district._sum.person_target || 0;
      const carb = district._sum.person_carb || 0;
      const percentage = target > 0 ? parseFloat(((carb / target) * 100).toFixed(2)) : 0;
      
      return {
        code: district.amp_code,
        name: district.amp_name,
        target: Math.round(target),
        carb: Math.round(carb),
        percentage
      };
    });

    // Calculate totals
    const totalCarb = formattedDistricts.reduce((sum, item) => sum + item.carb, 0);
    const totalTarget = formattedDistricts.reduce((sum, item) => sum + item.target, 0);
    const overallPercentage = totalTarget > 0 
      ? parseFloat(((totalCarb / totalTarget) * 100).toFixed(2))
      : 0;

    // Format the response
    const response: CarbResponse = {
      districts: formattedDistricts,
      summary: {
        totalTarget,
        totalCarb,
        overallPercentage,
        districtCount: formattedDistricts.length
      }
    };

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in /api/dashboard/carb:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch carb data',
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
