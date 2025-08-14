import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/groups/all - Get all active groups (for browsing/enrollment)
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    // Get all active groups for browsing
    const allGroups = await prisma.group.findMany({
      where: { isActive: true },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            level: true,
            description: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
            avatar: true,
            isActive: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Also get user's current enrollment info
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Add enrollment status to each group
    const groupsWithStatus = allGroups.map((group) => ({
      ...group,
      isUserEnrolled:
        userRole === "STUDENT" && currentUser?.groupId === group.id,
      isTeacherOwned: userRole === "TEACHER" && group.teacherId === userId,
      canEnroll:
        userRole === "STUDENT" &&
        !currentUser?.groupId &&
        group.students.length < group.maxStudents,
    }));

    console.log(
      "All groups API: Returning",
      groupsWithStatus.length,
      "groups for",
      userRole,
      "user:",
      userId,
    );

    return NextResponse.json({
      groups: groupsWithStatus,
      currentUserGroup: currentUser?.group,
    });
  } catch (error) {
    console.error("Get all groups error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
