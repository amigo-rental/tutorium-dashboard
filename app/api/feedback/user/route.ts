import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/feedback/user - Get all feedback for the current user
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["STUDENT"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;

    // Get all feedback for this user
    const feedback = await (prisma as any).lessonFeedback.findMany({
      where: {
        studentId: userId,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Get user feedback error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
