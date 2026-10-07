import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organization: true,
        createdAt: true,
        _count: {
          select: {
            createdTrees: true,
            inspections: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json({ error: "Failed to fetch user directory" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and new role are required" }, { status: 400 });
    }

    const validRoles = ["ADMIN", "PROJECT_MANAGER", "SURVEYOR", "VIEWER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    // Prevent demoting the last active administrator
    if (role !== "ADMIN") {
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (targetUser?.role === "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "Cannot demote the sole system administrator. Promote another admin first." },
            { status: 400 }
          );
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "UPDATE_USER_ROLE",
        entityType: "User",
        entityId: userId,
        newValue: role,
        metadata: JSON.stringify({
          summary: `Updated role of ${updated.name} to ${role}`,
          performedBy: currentUser.email,
        }),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Admin user role update error:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
