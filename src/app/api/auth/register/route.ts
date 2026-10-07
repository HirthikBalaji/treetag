import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, organization, role } = parsed.data;
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const userCount = await prisma.user.count();
    const assignedRole = userCount === 0 ? "ADMIN" : (role || "SURVEYOR");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        organization: organization || "TreeTag Sustainability Team",
        role: assignedRole,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      },
    });

    // Ensure at least one initial survey project exists for the new organization
    const projectCount = await prisma.project.count();
    if (projectCount === 0) {
      await prisma.project.create({
        data: {
          code: "REGISTRY-01",
          name: "Main Canopy Survey",
          description: "Primary field survey registry for urban trees and campus flora.",
          centerLat: 13.0827,
          centerLng: 80.2707,
          zoom: 14,
          areaSqKm: 15.0,
          organization: user.organization || "TreeTag Registry",
          members: {
            create: {
              userId: user.id,
              role: "ADMIN",
            },
          },
        },
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
      avatar: user.avatar,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organization: user.organization,
          avatar: user.avatar,
        },
      },
      { status: 201 }
    );

    response.cookies.set("treetag_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register account" },
      { status: 500 }
    );
  }
}
