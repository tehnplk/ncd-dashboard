import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await prisma.preventionAmp.findUnique({
      where: {
        amp_code: id
      }
    });
    
    if (!result) {
      return NextResponse.json({ error: 'PreventionAmp not found' }, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching PreventionAmp:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json();
    const {
      total_officer,
      total_pop,
      osm_provider,
      officer_provider,
      target_pop,
      prevention_visit,
      normal_pop,
      risk_pop,
      sick_pop,
      trained,
      risk_to_normal,
      weight_reduce,
      weight_reduce_avg
    } = body;
    
    const result = await prisma.preventionAmp.update({
      where: {
        amp_code: id
      },
      data: {
        total_officer,
        total_pop,
        osm_provider,
        officer_provider,
        target_pop,
        prevention_visit,
        normal_pop,
        risk_pop,
        sick_pop,
        trained,
        risk_to_normal,
        weight_reduce,
        weight_reduce_avg,
        updated_at: new Date()
      }
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating PreventionAmp:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}