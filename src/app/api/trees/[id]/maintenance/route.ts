import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { maintenanceSchema } from "@/lib/validations";

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
    const parsed = maintenanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const maintenance = await prisma.maintenance.create({
      data: {
        treeId: tree.id,
        performedById: user ? user.id : tree.createdById,
        maintenanceType: data.maintenanceType,
        performedAt: data.performedAt ? new Date(data.performedAt) : new Date(),
        description: data.description,
        notes: data.notes || null,
        cost: data.cost || null,
      },
    });

    // Update maintenance flags on tree if resolved
    const updateData: any = {};
    if (data.maintenanceType === "WATERING") updateData.irrigationRequired = false;
    if (data.maintenanceType === "PRUNING") updateData.pruningRequired = false;
    if (data.maintenanceType === "FERTILIZATION") updateData.fertilizationRequired = false;
    if (data.maintenanceType === "PEST_CONTROL") updateData.pestControlRequired = false;
    if (data.maintenanceType === "STRUCTURAL_SUPPORT") updateData.supportRequired = false;

    if (Object.keys(updateData).length > 0) {
      await prisma.tree.update({
        where: { id: tree.id },
        data: updateData,
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user ? user.id : null,
        action: "MAINTENANCE",
        entityType: "MAINTENANCE",
        entityId: maintenance.id,
        metadata: JSON.stringify({
          summary: `${user ? user.name : "Technician"} performed ${data.maintenanceType} on ${tree.treeCode}: ${data.description}`,
        }),
      },
    });

    return NextResponse.json({ success: true, maintenance }, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance log:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance log" },
      { status: 500 }
    );
  }
}
