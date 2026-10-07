import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
    const { fileUrl, photoType, caption, isPrimary } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: "Photo URL is required" }, { status: 400 });
    }

    if (isPrimary) {
      await prisma.photo.updateMany({
        where: { treeId: tree.id },
        data: { isPrimary: false },
      });
    }

    const photo = await prisma.photo.create({
      data: {
        treeId: tree.id,
        uploadedById: user ? user.id : tree.createdById,
        fileUrl,
        thumbnailUrl: fileUrl,
        photoType: photoType || "FULL_TREE",
        caption: caption || `Photo of ${tree.commonName}`,
        latitude: tree.latitude,
        longitude: tree.longitude,
        capturedAt: new Date(),
        isPrimary: isPrimary || false,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user ? user.id : null,
        action: "PHOTO_UPLOAD",
        entityType: "PHOTO",
        entityId: photo.id,
        metadata: JSON.stringify({
          summary: `${user ? user.name : "Surveyor"} uploaded photo for ${tree.treeCode}`,
          photoType: photo.photoType,
        }),
      },
    });

    return NextResponse.json({ success: true, photo }, { status: 201 });
  } catch (error) {
    console.error("Error adding photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
