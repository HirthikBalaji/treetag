import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      hasUsers: userCount > 0,
      userCount,
    });
  } catch {
    return NextResponse.json({ hasUsers: false, userCount: 0 });
  }
}
