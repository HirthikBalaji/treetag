import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { commonName: { contains: search, mode: "insensitive" } },
        { scientificName: { contains: search, mode: "insensitive" } },
        { family: { contains: search, mode: "insensitive" } },
        { genus: { contains: search, mode: "insensitive" } },
      ];
    }

    const species = await prisma.species.findMany({
      where,
      orderBy: { commonName: "asc" },
    });

    return NextResponse.json({ species });
  } catch (error) {
    console.error("Error fetching species:", error);
    return NextResponse.json(
      { error: "Failed to fetch species database" },
      { status: 500 }
    );
  }
}
