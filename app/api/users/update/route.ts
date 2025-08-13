import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;

    const body = await request.json();
    const { firstName, lastName, email, level } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 },
      );
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already taken by another user" },
        { status: 400 },
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: `${firstName} ${lastName}`,
        email,
        level: level || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        level: updatedUser.level,
        avatar: updatedUser.avatar,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
