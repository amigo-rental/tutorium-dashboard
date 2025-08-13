import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/courses/user - Get courses for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    let courses: any[] = [];

    if (userRole === "STUDENT") {
      // For students, get their group as a course
      const student = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          group: {
            include: {
              _count: {
                select: {
                  recordings: true,
                },
              },
            },
          },
        },
      });

      if (student?.group) {
        const totalRecordings = student.group._count.recordings;
        const completedRecordings = Math.floor(totalRecordings * 0.6); // Mock progress

        courses = [
          {
            id: student.group.id,
            title: student.group.name,
            level: student.group.level,
            progressPercent: Math.min(
              (completedRecordings / totalRecordings) * 100,
              100,
            ),
            teacher: "Преподаватель",
            nextLesson: "Следующее занятие",
            totalLessons: totalRecordings,
            completedLessons: completedRecordings,
            coverImage: undefined,
          },
        ];
      }
    } else if (userRole === "TEACHER") {
      // For teachers, get their groups as courses
      const teacherGroups = await prisma.group.findMany({
        where: { teacherId: userId },
        include: {
          _count: {
            select: {
              recordings: true,
              students: true,
            },
          },
        },
      });

      courses = teacherGroups.map((group) => {
        const totalRecordings = group._count.recordings;
        const completedRecordings = Math.floor(totalRecordings * 0.7); // Mock progress

        return {
          id: group.id,
          title: group.name,
          level: group.level,
          progressPercent: Math.min(
            (completedRecordings / totalRecordings) * 100,
            100,
          ),
          teacher: "Вы",
          nextLesson: "Следующее занятие",
          totalLessons: totalRecordings,
          completedLessons: completedRecordings,
          coverImage: undefined,
        };
      });
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Get user courses error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
