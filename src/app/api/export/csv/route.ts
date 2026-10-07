import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { treesToCSV } from "@/lib/geo";

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
      },
      orderBy: { treeCode: "asc" },
    });

    const csvData = treesToCSV(trees);

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="treetag-registry.csv"',
      },
    });
  } catch (error) {
    console.error("Error generating CSV export:", error);
    return NextResponse.json(
      { error: "Failed to export CSV" },
      { status: 500 }
    );
  }
}
