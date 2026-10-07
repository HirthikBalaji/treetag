import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: {
            trees: true,
            members: true,
          },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, role: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "PROJECT_MANAGER")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin or PM permissions required to create projects." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, code, description, centerLat, centerLng, zoom, areaSqKm } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and project code are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        code: code.toUpperCase().trim(),
        description,
        centerLat: centerLat || 13.0827,
        centerLng: centerLng || 80.2707,
        zoom: zoom || 14,
        areaSqKm: areaSqKm || 10.0,
        organization: user.organization || "MAHI Club",
        members: {
          create: {
            userId: user.id,
            role: user.role,
          },
        },
      },
      include: {
        _count: {
          select: { trees: true, members: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entityType: "PROJECT",
        entityId: project.id,
        metadata: JSON.stringify({
          summary: `${user.name} created new project: ${project.name} (${project.code})`,
        }),
      },
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
