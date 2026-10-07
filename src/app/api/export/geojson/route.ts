import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { treesToGeoJSON } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const where: any = {};
    if (projectId && projectId !== "ALL") where.projectId = projectId;

    const trees = await prisma.tree.findMany({
      where,
      include: {
        project: { select: { name: true, code: true } },
        createdBy: { select: { name: true } },
        photos: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    const geoJson = treesToGeoJSON(trees);

    return new NextResponse(JSON.stringify(geoJson, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/geo+json",
        "Content-Disposition": 'attachment; filename="treetag-registry.geojson"',
      },
    });
  } catch (error) {
    console.error("Error generating GeoJSON export:", error);
    return NextResponse.json(
      { error: "Failed to export GeoJSON" },
      { status: 500 }
    );
  }
}
