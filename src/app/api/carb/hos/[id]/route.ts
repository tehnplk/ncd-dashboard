import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Ensure params is resolved
        const resolvedParams = await Promise.resolve(params);
        const id = parseInt(resolvedParams.id);

        const carb = await prisma.carb.findUnique({
            where: { id },
            select: {
                id: true,
                hoscode: true,
                hosname: true,
                hostype: true,
                tmb_code: true,
                tmb_name: true,
                amp_code: true,
                amp_name: true,
                person_target: true,
                person_carb: true,
                percentage: true,
                person_diff: true,
                updated_at: true
            }
        });

        if (!carb) {
            return NextResponse.json(
                { error: "Carb record not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(carb);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch carb record" },
            { status: 500 }
        );
    }
}


export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Ensure params is resolved
        const resolvedParams = await Promise.resolve(params);
        const id = parseInt(resolvedParams.id);
        const body = await request.json();

        const updatedCarb = await prisma.carb.update({
            where: { id },
            data: {
                hoscode: body.hoscode,
                hosname: body.hosname,
                hostype: body.hostype,
                tmb_code: body.tmb_code,
                tmb_name: body.tmb_name,
                amp_code: body.amp_code,
                amp_name: body.amp_name,
                person_target: body.person_target || 0,
                person_carb: body.person_carb || 0,
                // Calculate percentage and difference
                percentage: body.person_target === 0 ? 0 : (body.person_carb / body.person_target) * 100,
                person_diff: (body.person_target || 0) - (body.person_carb || 0),
                updated_at: new Date()
            }
        });

        return NextResponse.json(updatedCarb);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update carb record" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Ensure params is resolved
        const resolvedParams = await Promise.resolve(params);
        const id = parseInt(resolvedParams.id);

        const deletedCarb = await prisma.carb.delete({
            where: { id }
        });

        return NextResponse.json(deletedCarb);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete carb record" },
            { status: 500 }
        );
    }
}

