const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAll() {
  console.log("🧹 Completely clearing all database records to start fresh...");
  await prisma.auditLog.deleteMany({});
  await prisma.maintenance.deleteMany({});
  await prisma.inspection.deleteMany({});
  await prisma.photo.deleteMany({});
  await prisma.tree.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  // Also clear species if desired, or keep standard botanical reference
  await prisma.species.deleteMany({});

  console.log("✅ Database is now 100% EMPTY: 0 trees, 0 users, 0 logs.");
}

clearAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
