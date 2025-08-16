import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    // Use requireRole to authenticate the user
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    // Check if authCheck is a NextResponse (redirect/error) or AuthCheckResult
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    if (!authCheck.success || !authCheck.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = authCheck.user.id;

    // Fetch user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        level: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        groupId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
