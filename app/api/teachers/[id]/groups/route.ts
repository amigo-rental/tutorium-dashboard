import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/teachers/[id]/groups - Get teacher groups
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    // Only allow teachers to see their own groups, or admins to see any teacher's groups
    if (userRole === "TEACHER" && userId !== id) {
      return NextResponse.json(
        { error: "Unauthorized to view other teacher groups" },
        { status: 403 },
      );
    }

    const teacherId = id;

    const groups = await prisma.group.findMany({
      where: {
        teacherId: teacherId,
        isActive: true,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            level: true,
            description: true,
          },
        },
        _count: {
          select: {
            students: true,
            lessons: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
            avatar: true,
          },
        },
        lessons: {
          where: {
            isActive: true,
            status: "COMPLETED",
          },
          orderBy: {
            date: "desc",
          },
          take: 1,
          select: {
            id: true,
            title: true,
            date: true,
            averageRating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedGroups = groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      level: group.level,
      maxStudents: group.maxStudents,
      isActive: group.isActive,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      teacherId: group.teacherId,
      courseId: group.courseId,
      course: group.course,
      studentCount: group._count.students,
      lessonCount: group._count.lessons,
      students: group.students,
      lastLesson: group.lessons[0] || null,
      progress:
        group._count.lessons > 0
          ? Math.min(75, Math.round((group._count.lessons / 20) * 100))
          : 0, // Mock progress calculation
    }));

    return NextResponse.json(formattedGroups);
  } catch (error) {
    console.error("Get teacher groups error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
