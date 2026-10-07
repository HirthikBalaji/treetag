import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { inspectionSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    let user = await getCurrentUser();
    if (!user) {
      user = await prisma.user.findFirst({ where: { role: "SURVEYOR" } });
    }

    const { id } = params;
    const tree = await prisma.tree.findFirst({
      where: { OR: [{ id }, { treeCode: id }] },
    });

    if (!tree) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = inspectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const inspection = await prisma.inspection.create({
      data: {
        treeId: tree.id,
        inspectorId: user ? user.id : tree.createdById,
        inspectionDate: new Date(),
        healthStatus: data.healthStatus,
        riskLevel: data.riskLevel,
        observations: data.observations || null,
        recommendations: data.recommendations || null,
        photos: data.photos ? JSON.stringify(data.photos) : null,
        nextInspectionDate: data.nextInspectionDate ? new Date(data.nextInspectionDate) : null,
      },
    });

    // Update tree health status and next inspection date
    await prisma.tree.update({
      where: { id: tree.id },
      data: {
        healthStatus: data.healthStatus,
        riskLevel: data.riskLevel,
        lastInspectedAt: new Date(),
        nextInspectionAt: data.nextInspectionDate ? new Date(data.nextInspectionDate) : null,
        updatedById: user ? user.id : tree.updatedById,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user ? user.id : null,
        action: "INSPECTION",
        entityType: "INSPECTION",
        entityId: inspection.id,
        oldValue: JSON.stringify({ healthStatus: tree.healthStatus, riskLevel: tree.riskLevel }),
        newValue: JSON.stringify({ healthStatus: data.healthStatus, riskLevel: data.riskLevel }),
        metadata: JSON.stringify({
          summary: `${user ? user.name : "Inspector"} completed inspection for ${tree.treeCode}: ${data.healthStatus}`,
        }),
      },
    });

    return NextResponse.json({ success: true, inspection }, { status: 201 });
  } catch (error) {
    console.error("Error creating inspection:", error);
    return NextResponse.json(
      { error: "Failed to create inspection report" },
      { status: 500 }
    );
  }
}
