import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const treeCount = await prisma.tree.count({
    where: { createdById: user.id },
  });

  return NextResponse.json({
    user: {
      ...user,
      treeCount,
    },
    treeCount,
  });
}
