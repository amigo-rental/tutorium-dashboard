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
      // For students, get lessons from their group
      const student = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          group: {
            include: {
              teacher: true,
              recordings: {
                where: {
                  date: {
                    gte: new Date(),
                  },
                },
                orderBy: {
                  date: "asc",
                },
                take: 5,
              },
            },
          },
        },
      });

      if (student?.group?.recordings) {
        upcomingLessons = student.group.recordings.map((recording: any) => ({
          id: recording.id,
          date: recording.date.toISOString().split("T")[0],
          time: recording.date.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          title: `${student.group?.name} - ${recording.lessonType === "GROUP" ? "Групповое занятие" : "Индивидуальное занятие"}`,
          teacher: student.group?.teacher?.name || "Преподаватель",
          duration: "60 минут",
          meetingLink: recording.youtubeLink,
          type: recording.lessonType.toLowerCase(),
        }));
      }
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
