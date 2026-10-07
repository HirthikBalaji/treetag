import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const tree = await prisma.tree.findFirst({
      where: {
        OR: [{ id }, { treeCode: id }],
      },
      include: {
        project: true,
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        photos: {
          include: {
            uploadedBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        inspections: {
          include: {
            inspector: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { inspectionDate: "desc" },
        },
        maintenances: {
          include: {
            performedBy: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { performedAt: "desc" },
        },
      },
    });

    if (!tree) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 });
    }

    // Fetch related audit logs for this tree
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entityType: "TREE",
        entityId: tree.id,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tree, auditLogs });
  } catch (error) {
    console.error("Error fetching tree details:", error);
    return NextResponse.json(
      { error: "Failed to fetch tree details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const { id } = params;

    const existingTree = await prisma.tree.findFirst({
      where: { OR: [{ id }, { treeCode: id }] },
    });

    if (!existingTree) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 });
    }

    const body = await req.json();

    // Clean and validate update fields
    const updatedTree = await prisma.tree.update({
      where: { id: existingTree.id },
      data: {
        ...body,
        updatedById: user ? user.id : existingTree.updatedById,
        updatedAt: new Date(),
      },
      include: {
        project: true,
        photos: true,
      },
    });

    // Write audit log entry
    await prisma.auditLog.create({
      data: {
        userId: user ? user.id : null,
        action: "UPDATE",
        entityType: "TREE",
        entityId: existingTree.id,
        oldValue: JSON.stringify({
          healthStatus: existingTree.healthStatus,
          riskLevel: existingTree.riskLevel,
          notes: existingTree.notes,
        }),
        newValue: JSON.stringify({
          healthStatus: updatedTree.healthStatus,
          riskLevel: updatedTree.riskLevel,
          notes: updatedTree.notes,
        }),
        metadata: JSON.stringify({
          summary: `${user ? user.name : "Editor"} updated tree ${existingTree.treeCode}`,
        }),
      },
    });

    return NextResponse.json({ success: true, tree: updatedTree });
  } catch (error) {
    console.error("Error updating tree:", error);
    return NextResponse.json(
      { error: "Failed to update tree" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "PROJECT_MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or Project Manager permissions required." },
        { status: 403 }
      );
    }

    const { id } = params;
    const tree = await prisma.tree.findFirst({
      where: { OR: [{ id }, { treeCode: id }] },
    });

    if (!tree) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 });
    }

    await prisma.tree.delete({
      where: { id: tree.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE",
        entityType: "TREE",
        entityId: tree.id,
        metadata: JSON.stringify({
          summary: `${user.name} deleted tree ${tree.treeCode} (${tree.commonName})`,
        }),
      },
    });

    return NextResponse.json({ success: true, message: "Tree deleted successfully" });
  } catch (error) {
    console.error("Error deleting tree:", error);
    return NextResponse.json(
      { error: "Failed to delete tree" },
      { status: 500 }
    );
  }
}
