import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/lessons/upcoming - Get upcoming lessons for a user
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    let upcomingLessons: any[] = [];

    if (userRole === "STUDENT") {
      // For students, get upcoming recordings from their enrolled groups and individual recordings
      const recordings = await prisma.recording.findMany({
        where: {
          OR: [
            // Group recordings where student is enrolled
            {
              group: {
                students: {
                  some: {
                    id: userId,
                  },
                },
              },
            },
            // Individual recordings where student is directly assigned
            {
              students: {
                some: {
                  id: userId,
                },
              },
            },
          ],
          date: {
            gte: new Date(),
          },
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
        take: 5,
      });

      upcomingLessons = recordings.map((recording: any) => ({
        id: recording.id,
        date: recording.date.toISOString().split("T")[0],
        time: recording.date.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        title:
          recording.lessonType === "GROUP"
            ? `${recording.group?.name || "Группа"} - Групповое занятие`
            : `Индивидуальное занятие`,
        teacher: recording.teacher?.name || "Преподаватель",
        duration: "60 минут",
        meetingLink: recording.youtubeLink,
        type: recording.lessonType.toLowerCase(),
      }));
    } else if (userRole === "TEACHER") {
      // For teachers, get upcoming recordings they've created
      const teacherRecordings = await prisma.recording.findMany({
        where: {
          teacherId: userId,
          date: {
            gte: new Date(),
          },
        },
        include: {
          group: true,
          students: true,
        },
        orderBy: {
          date: "asc",
        },
        take: 5,
      });

      upcomingLessons = teacherRecordings.map((recording) => ({
        id: recording.id,
        date: recording.date.toISOString().split("T")[0],
        time: recording.date.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        title:
          recording.lessonType === "GROUP"
            ? `${recording.group?.name || "Группа"} - Групповое занятие`
            : `Индивидуальное занятие с ${recording.students.map((s) => s.name).join(", ")}`,
        teacher: "Вы",
        duration: "60 минут",
        meetingLink: recording.youtubeLink,
        type: recording.lessonType.toLowerCase(),
      }));
    }

    return NextResponse.json(upcomingLessons);
  } catch (error) {
    console.error("Get upcoming lessons error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
