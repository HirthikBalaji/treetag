const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SPECIES_DATA = [
  {
    commonName: "Neem",
    scientificName: "Azadirachta indica",
    family: "Meliaceae",
    genus: "Azadirachta",
    species: "indica",
    nativeStatus: true,
    description: "Renowned medicinal tree native to the Indian subcontinent. Drought resistant, evergreen, and noted for natural pest repellent properties.",
    growthRate: "Moderate to Fast",
    typicalHeight: 18.0,
    lifespan: 200,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Banyan",
    scientificName: "Ficus benghalensis",
    family: "Moraceae",
    genus: "Ficus",
    species: "benghalensis",
    nativeStatus: true,
    description: "National tree of India. Characterized by extensive aerial prop roots, vast spreading canopy, and immense ecological keystone role.",
    growthRate: "Moderate",
    typicalHeight: 25.0,
    lifespan: 400,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Peepal / Sacred Fig",
    scientificName: "Ficus religiosa",
    family: "Moraceae",
    genus: "Ficus",
    species: "religiosa",
    nativeStatus: true,
    description: "Revered semi-evergreen fig with heart-shaped leaves and distinctive extended tail-like drip tip. Significant oxygen producer.",
    growthRate: "Fast",
    typicalHeight: 28.0,
    lifespan: 500,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Tamarind",
    scientificName: "Tamarindus indica",
    family: "Fabaceae",
    genus: "Tamarindus",
    species: "indica",
    nativeStatus: true,
    description: "Slow-growing, long-lived hardwood producing edible pod-like fruit. High wind resistance and dense, shade-providing canopy.",
    growthRate: "Slow",
    typicalHeight: 22.0,
    lifespan: 250,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Gulmohar / Royal Poinciana",
    scientificName: "Delonix regia",
    family: "Fabaceae",
    genus: "Delonix",
    species: "regia",
    nativeStatus: false,
    description: "Famed ornamental tree with flamboyant clusters of bright scarlet/orange blossoms and umbrella-shaped spreading canopy.",
    growthRate: "Fast",
    typicalHeight: 12.0,
    lifespan: 60,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Teak",
    scientificName: "Tectona grandis",
    family: "Lamiaceae",
    genus: "Tectona",
    species: "grandis",
    nativeStatus: true,
    description: "Large deciduous tree prized for extraordinarily durable, water-resistant timber and broad textured foliage.",
    growthRate: "Moderate",
    typicalHeight: 30.0,
    lifespan: 150,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Indian Rosewood / Sissoo",
    scientificName: "Dalbergia latifolia",
    family: "Fabaceae",
    genus: "Dalbergia",
    species: "latifolia",
    nativeStatus: true,
    description: "Premium native hardwood with deep aromatic grain. Nitrogen-fixing legume supporting soil regeneration.",
    growthRate: "Moderate",
    typicalHeight: 25.0,
    lifespan: 180,
    conservationStatus: "Vulnerable",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Rain Tree",
    scientificName: "Samanea saman",
    family: "Fabaceae",
    genus: "Samanea",
    species: "saman",
    nativeStatus: false,
    description: "Immense umbrella canopy providing massive urban shade. Leaflets fold inward during overcast weather and at dusk.",
    growthRate: "Fast",
    typicalHeight: 25.0,
    lifespan: 100,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Sita Ashoka",
    scientificName: "Saraca asoca",
    family: "Fabaceae",
    genus: "Saraca",
    species: "asoca",
    nativeStatus: true,
    description: "Sacred evergreen forest tree producing fragrant orange-yellow blossoms. Highly endangered indigenous medicinal tree.",
    growthRate: "Slow",
    typicalHeight: 9.0,
    lifespan: 120,
    conservationStatus: "Vulnerable",
    imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Copperpod / Yellow Gulmohar",
    scientificName: "Peltophorum pterocarpum",
    family: "Fabaceae",
    genus: "Peltophorum",
    species: "pterocarpum",
    nativeStatus: true,
    description: "Deciduous canopy tree with dense golden flower sprays and winged coppery seed pods. Widely planted in coastal urban corridors.",
    growthRate: "Fast",
    typicalHeight: 18.0,
    lifespan: 75,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Indian Beech / Pungai",
    scientificName: "Millettia pinnata",
    family: "Fabaceae",
    genus: "Millettia",
    species: "pinnata",
    nativeStatus: true,
    description: "Tough coastal tree capable of fixing nitrogen and withstanding saline soil and intense monsoon winds. Seeds yield biofuel oils.",
    growthRate: "Moderate",
    typicalHeight: 15.0,
    lifespan: 100,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Arjuna Tree",
    scientificName: "Terminalia arjuna",
    family: "Combretaceae",
    genus: "Terminalia",
    species: "arjuna",
    nativeStatus: true,
    description: "Majestic riverine tree with smooth grey bark and large buttressed trunk. Central in traditional Ayurvedic cardiology.",
    growthRate: "Moderate",
    typicalHeight: 25.0,
    lifespan: 200,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Jamun / Black Plum",
    scientificName: "Syzygium cumini",
    family: "Myrtaceae",
    genus: "Syzygium",
    species: "cumini",
    nativeStatus: true,
    description: "Evergreen tropical tree producing deep purple astringent sweet berries. Supports vast pollinator communities and avian biodiversity.",
    growthRate: "Fast",
    typicalHeight: 20.0,
    lifespan: 120,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Mango",
    scientificName: "Mangifera indica",
    family: "Anacardiaceae",
    genus: "Mangifera",
    species: "indica",
    nativeStatus: true,
    description: "Broad evergreen fruit tree native to South Asia. Thick dense canopy offers exceptional thermal cooling and bird nesting habitat.",
    growthRate: "Moderate",
    typicalHeight: 20.0,
    lifespan: 150,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80",
  },
  {
    commonName: "Kadamba",
    scientificName: "Neolamarckia cadamba",
    family: "Rubiaceae",
    genus: "Neolamarckia",
    species: "cadamba",
    nativeStatus: true,
    description: "Fast-growing evergreen with broad horizontal branching and spherical fragrant pin-cushion flowers. Important in agroforestry.",
    growthRate: "Very Fast",
    typicalHeight: 35.0,
    lifespan: 90,
    conservationStatus: "Least Concern",
    imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
  }
];

const TREE_PHOTOS = [
  "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
];

async function main() {
  console.log("🌱 Cleaning existing records...");
  await prisma.auditLog.deleteMany({});
  await prisma.maintenance.deleteMany({});
  await prisma.inspection.deleteMany({});
  await prisma.photo.deleteMany({});
  await prisma.tree.deleteMany({});
  await prisma.species.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("👤 Seeding Users with roles...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@treetag.org",
      name: "Hirthik Sharma",
      passwordHash,
      role: "ADMIN",
      organization: "MAHI Club & Green Earth",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    }
  });

  const pm = await prisma.user.create({
    data: {
      email: "pm@treetag.org",
      name: "Dr. Sunita Rao",
      passwordHash,
      role: "PROJECT_MANAGER",
      organization: "MAHI Club",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"
    }
  });

  const arjun = await prisma.user.create({
    data: {
      email: "arjun@treetag.org",
      name: "Arjun Patel",
      passwordHash,
      role: "SURVEYOR",
      organization: "MAHI Club Volunteers",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    }
  });

  const priya = await prisma.user.create({
    data: {
      email: "priya@treetag.org",
      name: "Priya Sundaram",
      passwordHash,
      role: "SURVEYOR",
      organization: "Campus Biodiversity Cell",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
    }
  });

  const rahul = await prisma.user.create({
    data: {
      email: "rahul@treetag.org",
      name: "Rahul Varma",
      passwordHash,
      role: "SURVEYOR",
      organization: "MAHI Club Volunteers",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    }
  });

  const viewer = await prisma.user.create({
    data: {
      email: "viewer@treetag.org",
      name: "Ananya Iyer",
      passwordHash,
      role: "VIEWER",
      organization: "Public Visitor",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80"
    }
  });

  console.log("📁 Seeding Projects...");
  const campusProject = await prisma.project.create({
    data: {
      code: "CAMPUS-2026",
      name: "Campus Tree Survey 2026",
      description: "Comprehensive botanical inventory and canopy density assessment for higher education campus zones.",
      centerLat: 13.0827,
      centerLng: 80.2707,
      zoom: 15,
      areaSqKm: 8.4,
      organization: "MAHI Club",
      members: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: pm.id, role: "PROJECT_MANAGER" },
          { userId: arjun.id, role: "SURVEYOR" },
          { userId: priya.id, role: "SURVEYOR" },
          { userId: rahul.id, role: "SURVEYOR" }
        ]
      }
    }
  });

  const chennaiProject = await prisma.project.create({
    data: {
      code: "CHENNAI-BIO",
      name: "Chennai Biodiversity Corridor",
      description: "Monitoring native biodiversity, microclimates, and thermal buffer trees across urban ecological corridors.",
      centerLat: 13.0450,
      centerLng: 80.2450,
      zoom: 13,
      areaSqKm: 24.2,
      organization: "MAHI Club & Urban Ecology Lab",
      members: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: pm.id, role: "PROJECT_MANAGER" },
          { userId: priya.id, role: "SURVEYOR" }
        ]
      }
    }
  });

  const roadsideProject = await prisma.project.create({
    data: {
      code: "ROADSIDE-INV",
      name: "Avenue Tree & Street Canopy Inventory",
      description: "Evaluating avenue trees, root heave, electrical wire clearances, and structural storm resilience.",
      centerLat: 13.0100,
      centerLng: 80.2200,
      zoom: 14,
      areaSqKm: 14.8,
      organization: "Municipal Urban Forestry Wing",
      members: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: rahul.id, role: "SURVEYOR" }
        ]
      }
    }
  });

  console.log("🌿 Seeding Species Database...");
  for (const s of SPECIES_DATA) {
    await prisma.species.create({ data: s });
  }

  console.log("🌳 Seeding 54 Detailed Trees with coordinates, health, measurements, and photos...");
  const healthStatuses = ["HEALTHY", "HEALTHY", "GOOD", "HEALTHY", "GOOD", "MODERATE", "POOR", "CRITICAL"];
  const riskLevels = ["LOW", "LOW", "LOW", "MODERATE", "HIGH", "EXTREME"];
  const surveyors = [arjun, priya, rahul, pm, admin];

  // Base coordinates around Chennai / Campus
  const baseLat = 13.0827;
  const baseLng = 80.2707;

  const treesCreated = [];

  for (let i = 1; i <= 56; i++) {
    const speciesObj = SPECIES_DATA[i % SPECIES_DATA.length];
    const surveyor = surveyors[i % surveyors.length];
    const project = i % 3 === 0 ? chennaiProject : (i % 5 === 0 ? roadsideProject : campusProject);

    // Natural spatial distribution within ~4 km radius
    const angle = (i * 137.5) * (Math.PI / 180);
    const radius = Math.sqrt(i) * 0.0035 + (Math.sin(i) * 0.001);
    const lat = baseLat + radius * Math.cos(angle);
    const lng = baseLng + radius * Math.sin(angle);

    const health = i === 12 || i === 47 ? "CRITICAL" : (i % 7 === 0 ? "POOR" : (i % 5 === 0 ? "MODERATE" : (i % 3 === 0 ? "GOOD" : "HEALTHY")));
    const risk = health === "CRITICAL" ? "EXTREME" : (health === "POOR" ? "HIGH" : (health === "MODERATE" ? "MODERATE" : "LOW"));

    const height = parseFloat((6 + (i * 0.35) % 18).toFixed(1));
    const circumference = parseFloat((40 + (i * 3.8) % 190).toFixed(1));
    const dbh = parseFloat((circumference / Math.PI).toFixed(1));
    const canopy = parseFloat((4 + (i * 0.4) % 14).toFixed(1));
    const age = Math.round(8 + (i * 2.2) % 65);

    const treeCode = `TR-${String(i).padStart(6, '0')}`;

    const createdTree = await prisma.tree.create({
      data: {
        treeCode,
        projectId: project.id,
        createdById: surveyor.id,
        updatedById: surveyor.id,
        commonName: speciesObj.commonName,
        scientificName: speciesObj.scientificName,
        family: speciesObj.family,
        genus: speciesObj.genus,
        species: speciesObj.species,
        nativeStatus: speciesObj.nativeStatus,
        identificationConfidence: 90 + (i % 10),
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6)),
        gpsAccuracy: parseFloat((2.5 + (i % 4) * 0.8).toFixed(1)),
        altitude: parseFloat((14 + (i % 15)).toFixed(1)),
        locationSource: i % 4 === 0 ? "MAP_ADJUSTED" : "DEVICE_GPS",
        height,
        trunkCircumference: circumference,
        dbh,
        canopyWidth: canopy,
        estimatedAge: age,
        healthStatus: health,
        riskLevel: risk,
        trunkCondition: health === "CRITICAL" ? "Fungal conks and extensive basal decay detected" : (health === "POOR" ? "Deep vertical fissure; moderate bark peeling" : "Firm, intact bark; no significant decay"),
        leafCondition: health === "CRITICAL" ? "Over 45% crown defoliation and chlorosis" : (health === "POOR" ? "Spotting and premature leaf drop" : "Vibrant, dense, fully turgid foliage"),
        structuralCondition: health === "CRITICAL" ? "Severe codominant lean (>18°) with compromised root plate" : "Upright balanced canopy architecture",
        pestStatus: health === "POOR" || health === "CRITICAL" ? "Active stem borer emergence holes" : "None detected",
        diseaseStatus: health === "CRITICAL" ? "Ganoderma rot suspected" : "Healthy vascular system",
        damageStatus: i % 6 === 0 ? "Limb torn during past monsoon storm" : "No mechanical damage",
        soilCondition: i % 3 === 0 ? "Loamy red soil with organic leaf mulch" : "Slightly compacted urban soil",
        sunlight: "Full Sunlight",
        waterAvailability: i % 2 === 0 ? "Monsoon rainwater catchment + drip canal" : "Natural ground moisture",
        surroundingEnvironment: i % 4 === 0 ? "Paved academic walkway" : "Open campus arboretum lawn",
        competition: "Adequate open spacing",
        irrigationRequired: health === "POOR" || health === "CRITICAL",
        pruningRequired: health === "CRITICAL" || i % 5 === 0,
        fertilizationRequired: health === "MODERATE" || health === "POOR",
        pestControlRequired: health === "CRITICAL" || health === "POOR",
        supportRequired: health === "CRITICAL",
        lastInspectedAt: new Date(Date.now() - (i * 2 + 1) * 24 * 3600 * 1000),
        nextInspectionAt: new Date(Date.now() + (30 - (i % 25)) * 24 * 3600 * 1000),
        notes: `Tree monitored under ${project.name}. Notable ecological specimen providing nesting for native songbirds.`,
        createdAt: new Date(Date.now() - (i * 3 + 2) * 24 * 3600 * 1000)
      }
    });

    treesCreated.push(createdTree);

    // Seed 2-3 photos per tree
    const primaryImg = TREE_PHOTOS[i % TREE_PHOTOS.length];
    const secondaryImg = TREE_PHOTOS[(i + 4) % TREE_PHOTOS.length];

    await prisma.photo.create({
      data: {
        treeId: createdTree.id,
        uploadedById: surveyor.id,
        fileUrl: primaryImg,
        thumbnailUrl: primaryImg,
        photoType: "FULL_TREE",
        caption: `Full habit view of ${speciesObj.commonName} (${treeCode})`,
        latitude: createdTree.latitude,
        longitude: createdTree.longitude,
        capturedAt: createdTree.createdAt,
        isPrimary: true,
      }
    });

    await prisma.photo.create({
      data: {
        treeId: createdTree.id,
        uploadedById: surveyor.id,
        fileUrl: secondaryImg,
        thumbnailUrl: secondaryImg,
        photoType: "LEAVES",
        caption: `Close-up foliage and leaf venation of ${speciesObj.scientificName}`,
        latitude: createdTree.latitude,
        longitude: createdTree.longitude,
        capturedAt: createdTree.createdAt,
        isPrimary: false,
      }
    });

    // Seed inspections
    if (i % 2 === 0 || health === "CRITICAL" || health === "POOR") {
      await prisma.inspection.create({
        data: {
          treeId: createdTree.id,
          inspectorId: pm.id,
          inspectionDate: new Date(Date.now() - (i * 1.5) * 24 * 3600 * 1000),
          healthStatus: health,
          riskLevel: risk,
          observations: `Comprehensive bi-annual survey. Trunk measured at ${circumference}cm circumference. Crown density evaluated.`,
          recommendations: health === "CRITICAL" ? "Immediate arborist crown thinning and root collar excavation." : "Maintain periodic irrigation and clear root flare.",
          photos: JSON.stringify([primaryImg]),
          nextInspectionDate: createdTree.nextInspectionAt
        }
      });
    }

    // Seed maintenance
    if (i % 3 === 0 || createdTree.pruningRequired || createdTree.irrigationRequired) {
      await prisma.maintenance.create({
        data: {
          treeId: createdTree.id,
          performedById: rahul.id,
          maintenanceType: i % 2 === 0 ? "PRUNING" : "WATERING",
          performedAt: new Date(Date.now() - (i * 2 + 5) * 24 * 3600 * 1000),
          description: i % 2 === 0 ? "Deadwood clearing and clearance pruning for public pathway" : "Deep root saturation irrigation and bio-mulch application",
          notes: "Task completed according to municipal arboriculture safety standards.",
          cost: 450.0
        }
      });
    }

    // Seed audit log
    await prisma.auditLog.create({
      data: {
        userId: surveyor.id,
        action: "CREATE",
        entityType: "TREE",
        entityId: createdTree.id,
        newValue: JSON.stringify({
          treeCode,
          commonName: speciesObj.commonName,
          healthStatus: health,
          coordinates: [createdTree.latitude, createdTree.longitude]
        }),
        metadata: JSON.stringify({
          summary: `${surveyor.name} registered ${speciesObj.commonName} (${treeCode})`
        }),
        createdAt: createdTree.createdAt
      }
    });

    if (health === "CRITICAL" || health === "POOR") {
      await prisma.auditLog.create({
        data: {
          userId: pm.id,
          action: "UPDATE",
          entityType: "TREE",
          entityId: createdTree.id,
          oldValue: JSON.stringify({ healthStatus: "GOOD" }),
          newValue: JSON.stringify({ healthStatus: health, riskLevel: risk }),
          metadata: JSON.stringify({
            summary: `Dr. Sunita Rao updated health status: Good → ${health}`
          }),
          createdAt: new Date(Date.now() - 3 * 3600 * 1000)
        }
      });
    }
  }

  console.log(`✅ Successfully seeded:
  - 6 Users with RBAC credentials (admin@treetag.org, pm@treetag.org, arjun@treetag.org, etc.)
  - 3 Active Projects with GIS boundaries
  - 15 Botanical Species records
  - 56 Geotagged Trees with rich measurements and health assessments
  - Over 110 High-res botanical photographs
  - Inspections, Maintenance Logs, and Audit Trails!
  `);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
