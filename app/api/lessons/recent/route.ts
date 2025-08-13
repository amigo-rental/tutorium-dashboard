import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/lessons/recent - Get recent lesson recordings for a user
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    let recentLessons: any[] = [];

    if (userRole === "STUDENT") {
      // For students, get recent recordings from their group
      const student = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          group: {
            include: {
              teacher: true,
              recordings: {
                where: {
                  date: {
                    lte: new Date(),
                  },
                },
                orderBy: {
                  date: "desc",
                },
                take: 10,
                include: {
                  attachments: true,
                },
              },
            },
          },
        },
      });

      if (student?.group?.recordings) {
        recentLessons = student.group.recordings.map((recording: any) => ({
          id: recording.id,
          title: `${student.group?.name} - ${recording.lessonType === "GROUP" ? "Групповое занятие" : "Индивидуальное занятие"}`,
          date: recording.date.toLocaleDateString("ru-RU", {
            month: "short",
            day: "numeric",
          }),
          time: recording.date.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          teacher: student.group?.teacher?.name || "Преподаватель",
          message: recording.message || "Занятие завершено",
          filesCount: recording.attachments.length,
          hasRecording: true,
          recordingUrl: recording.youtubeLink,
        }));
      }
    } else if (userRole === "TEACHER") {
      // For teachers, get recent recordings they've created
      const teacherRecordings = await prisma.recording.findMany({
        where: {
          teacherId: userId,
          date: {
            lte: new Date(),
          },
        },
        include: {
          group: true,
          students: true,
          attachments: true,
        },
        orderBy: {
          date: "desc",
        },
        take: 10,
      });

      recentLessons = teacherRecordings.map((recording) => ({
        id: recording.id,
        title:
          recording.lessonType === "GROUP"
            ? `${recording.group?.name || "Группа"} - Групповое занятие`
            : `Индивидуальное занятие с ${recording.students.map((s) => s.name).join(", ")}`,
        date: recording.date.toLocaleDateString("ru-RU", {
          month: "short",
          day: "numeric",
        }),
        time: recording.date.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        teacher: "Вы",
        message: recording.message || "Занятие завершено",
        filesCount: recording.attachments.length,
        hasRecording: true,
        recordingUrl: recording.youtubeLink,
      }));
    }

    return NextResponse.json(recentLessons);
  } catch (error) {
    console.error("Get recent lessons error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
