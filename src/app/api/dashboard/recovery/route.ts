import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define TypeScript interfaces for the response
interface RecoveryData {
  recovered: number;
  total: number;
  percentage: number;
  byDistrict: Array<{
    district: string;
    recovered: number;
    total: number;
    percentage: number;
  }>;
}

export async function GET() {
  try {
    console.log('Fetching recovery data...');
    
    // Get recovery data from Remission model
    const recoveryData = await prisma.remission.findMany({
      select: {
        amp_name: true,
        ncds_remission: true,
        // Using stopped_medication as a proxy for recovered patients
        // Adjust this based on your actual recovery criteria
        stopped_medication: true,
        // Using a sum of all medication fields as total patients
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
      orderBy: {
        amp_name: 'asc'
      }
    });

    // Format the recovery data
    const formattedData = recoveryData.map(district => {
      // Count recovered patients (using stopped_medication as a proxy)
      const recovered = district.stopped_medication || 0;
      
      // Calculate total patients as sum of all medication statuses
      const total = [
        district.reduced_1 || 0,
        district.reduced_2 || 0,
        district.reduced_3 || 0,
        district.reduced_4 || 0,
        district.reduced_5 || 0,
        district.reduced_6 || 0,
        district.reduced_7 || 0,
        district.reduced_8 || 0,
        district.reduced_n || 0,
        district.same_medication || 0,
        district.increased_medication || 0,
        district.pending_evaluation || 0,
        district.lost_followup || 0
      ].reduce((sum, val) => sum + val, 0);
      
      const percentage = total > 0 ? parseFloat(((recovered / total) * 100).toFixed(1)) : 0;
      
      return {
        district: district.amp_name || 'Unknown',
        recovered,
        total,
        percentage
      };
    });

    // Calculate totals
    const totalRecovered = formattedData.reduce((sum, d) => sum + d.recovered, 0);
    const totalPatients = formattedData.reduce((sum, d) => sum + d.total, 0);
    const totalPercentage = totalPatients > 0 
      ? parseFloat(((totalRecovered / totalPatients) * 100).toFixed(1))
      : 0;
    
    // Format the response
    const response: RecoveryData = {
      recovered: totalRecovered,
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
    console.error('Error fetching recovery data:', errorMessage);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch recovery data',
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
