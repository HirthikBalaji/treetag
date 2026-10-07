import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { treeSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const species = searchParams.get("species");
    const family = searchParams.get("family");
    const healthStatus = searchParams.get("healthStatus");
    const riskLevel = searchParams.get("riskLevel");
    const projectId = searchParams.get("projectId");
    const nativeStatus = searchParams.get("nativeStatus");
    const inspectionDue = searchParams.get("inspectionDue") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = searchParams.get("limit") === "all" ? 1000 : parseInt(searchParams.get("limit") || "50", 10);
    const minLat = searchParams.get("minLat") ? parseFloat(searchParams.get("minLat")!) : null;
    const maxLat = searchParams.get("maxLat") ? parseFloat(searchParams.get("maxLat")!) : null;
    const minLng = searchParams.get("minLng") ? parseFloat(searchParams.get("minLng")!) : null;
    const maxLng = searchParams.get("maxLng") ? parseFloat(searchParams.get("maxLng")!) : null;

    const where: any = {};

    if (search) {
      where.OR = [
        { treeCode: { contains: search, mode: "insensitive" } },
        { commonName: { contains: search, mode: "insensitive" } },
        { scientificName: { contains: search, mode: "insensitive" } },
        { family: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (species) where.scientificName = species;
    if (family) where.family = family;
    if (healthStatus && healthStatus !== "ALL") where.healthStatus = healthStatus;
    if (riskLevel && riskLevel !== "ALL") where.riskLevel = riskLevel;
    if (projectId && projectId !== "ALL") where.projectId = projectId;
    if (nativeStatus === "true") where.nativeStatus = true;
    if (nativeStatus === "false") where.nativeStatus = false;

    if (inspectionDue) {
      where.OR = [
        { nextInspectionAt: { lte: new Date() } },
        { lastInspectedAt: null },
      ];
    }

    if (minLat !== null && maxLat !== null && minLng !== null && maxLng !== null) {
      where.latitude = { gte: minLat, lte: maxLat };
      where.longitude = { gte: minLng, lte: maxLng };
    }

    const total = await prisma.tree.count({ where });

    const trees = await prisma.tree.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        photos: {
          orderBy: { isPrimary: "desc" },
        },
        _count: {
          select: {
            inspections: true,
            maintenances: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: limit === 1000 ? 0 : (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      trees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching trees:", error);
    return NextResponse.json(
      { error: "Failed to fetch tree records" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to register trees" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = treeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid tree data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Resolve project ID safely
    let resolvedProjectId = data.projectId;
    if (!resolvedProjectId || resolvedProjectId === "default") {
      let defaultProj = await prisma.project.findFirst();
      if (!defaultProj) {
        defaultProj = await prisma.project.create({
          data: {
            name: "Main Canopy Survey",
            code: "CANOPY-01",
            organization: user.organization || "MAHI Club",
            description: "Primary municipal and campus biodiversity survey plot",
            areaSqKm: 15.0,
            centerLat: 13.0827,
            centerLng: 80.2707,
          },
        });
      }
      resolvedProjectId = defaultProj.id;
    } else {
      const existing = await prisma.project.findUnique({ where: { id: resolvedProjectId } });
      if (!existing) {
        let defaultProj = await prisma.project.findFirst();
        if (!defaultProj) {
          defaultProj = await prisma.project.create({
            data: {
              name: "Main Canopy Survey",
              code: "CANOPY-01",
              organization: user.organization || "MAHI Club",
              description: "Primary municipal and campus biodiversity survey plot",
              areaSqKm: 15.0,
              centerLat: 13.0827,
              centerLng: 80.2707,
            },
          });
        }
        resolvedProjectId = defaultProj.id;
      }
    }

    // Calculate DBH if missing but circumference is present
    let calculatedDbh = data.dbh;
    if (!calculatedDbh && data.trunkCircumference) {
      calculatedDbh = parseFloat((data.trunkCircumference / Math.PI).toFixed(1));
    }

    // Generate unique sequential tree code
    const lastTree = await prisma.tree.findFirst({
      orderBy: { createdAt: "desc" },
      select: { treeCode: true },
    });
    let nextNum = 1;
    if (lastTree?.treeCode?.startsWith("TR-")) {
      const numPart = parseInt(lastTree.treeCode.replace("TR-", ""), 10);
      if (!isNaN(numPart)) nextNum = numPart + 1;
    }
    const treeCode = `TR-${String(nextNum).padStart(6, "0")}`;

    // Create tree record
    const newTree = await prisma.tree.create({
      data: {
        treeCode,
        projectId: resolvedProjectId,
        createdById: user.id,
        updatedById: user.id,
        commonName: data.commonName,
        scientificName: data.scientificName,
        family: data.family || null,
        genus: data.genus || null,
        species: data.species || null,
        variety: data.variety || null,
        nativeStatus: data.nativeStatus,
        identificationConfidence: data.identificationConfidence,
        latitude: data.latitude,
        longitude: data.longitude,
        gpsAccuracy: data.gpsAccuracy || null,
        altitude: data.altitude || null,
        locationSource: data.locationSource,
        height: data.height || null,
        trunkCircumference: data.trunkCircumference || null,
        dbh: calculatedDbh || null,
        canopyWidth: data.canopyWidth || null,
        estimatedAge: data.estimatedAge || null,
        healthStatus: data.healthStatus,
        riskLevel: data.riskLevel,
        trunkCondition: data.trunkCondition || null,
        leafCondition: data.leafCondition || null,
        structuralCondition: data.structuralCondition || null,
        pestStatus: data.pestStatus || null,
        diseaseStatus: data.diseaseStatus || null,
        damageStatus: data.damageStatus || null,
        soilCondition: data.soilCondition || null,
        sunlight: data.sunlight || null,
        waterAvailability: data.waterAvailability || null,
        surroundingEnvironment: data.surroundingEnvironment || null,
        competition: data.competition || null,
        irrigationRequired: data.irrigationRequired,
        pruningRequired: data.pruningRequired,
        fertilizationRequired: data.fertilizationRequired,
        pestControlRequired: data.pestControlRequired,
        supportRequired: data.supportRequired,
        notes: data.notes || null,
        visibility: data.visibility,
        lastInspectedAt: new Date(),
        nextInspectionAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });

    // If photos provided, attach them
    if (data.photos && data.photos.length > 0) {
      for (let i = 0; i < data.photos.length; i++) {
        const photo = data.photos[i];
        await prisma.photo.create({
          data: {
            treeId: newTree.id,
            uploadedById: user.id,
            fileUrl: photo.fileUrl,
            thumbnailUrl: photo.fileUrl,
            photoType: photo.photoType,
            caption: photo.caption || `${newTree.commonName} photo`,
            latitude: newTree.latitude,
            longitude: newTree.longitude,
            capturedAt: new Date(),
            isPrimary: photo.isPrimary || i === 0,
          },
        });
      }
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entityType: "TREE",
        entityId: newTree.id,
        newValue: JSON.stringify({
          treeCode: newTree.treeCode,
          commonName: newTree.commonName,
          healthStatus: newTree.healthStatus,
          latitude: newTree.latitude,
          longitude: newTree.longitude,
        }),
        metadata: JSON.stringify({
          summary: `${user.name} registered new specimen: ${newTree.commonName} (${newTree.treeCode})`,
        }),
      },
    });

    const fullTree = await prisma.tree.findUnique({
      where: { id: newTree.id },
      include: {
        project: true,
        createdBy: true,
        photos: true,
      },
    });

    return NextResponse.json({ success: true, tree: fullTree }, { status: 201 });
  } catch (error) {
    console.error("Error creating tree:", error);
    return NextResponse.json(
      { error: "Failed to create tree record" },
      { status: 500 }
    );
  }
}
