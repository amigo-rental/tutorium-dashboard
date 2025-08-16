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
      // For students, get recent completed lessons from their enrolled groups and individual lessons
      const lessons = await prisma.lesson.findMany({
        where: {
          OR: [
            // Group lessons where student is enrolled
            {
              group: {
                students: {
                  some: {
                    id: userId,
                  },
                },
              },
            },
            // Individual lessons where student is directly assigned
            {
              students: {
                some: {
                  id: userId,
                },
              },
            },
          ],
          status: "COMPLETED",
          isActive: true,
          youtubeLink: {
            not: null,
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
          topic: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          attachments: {
            select: {
              id: true,
              filename: true,
              originalName: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 5,
      });

      recentLessons = lessons.map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        date: lesson.date.toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: lesson.date.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        teacher: lesson.teacher?.name || "Преподаватель",
        message: lesson.notes || "Занятие завершено",
        filesCount: lesson.attachments.length,
        hasRecording: true,
        recordingUrl: lesson.youtubeLink,
        topic: lesson.topic?.name,
        groupName: lesson.group?.name,
      }));
    } else if (userRole === "TEACHER") {
      // For teachers, get recent completed lessons they've created
      const teacherLessons = await prisma.lesson.findMany({
        where: {
          teacherId: userId,
          status: "COMPLETED",
          isActive: true,
          youtubeLink: {
            not: null,
          },
        },
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          students: {
            select: {
              id: true,
              name: true,
            },
          },
          attachments: {
            select: {
              id: true,
              filename: true,
              originalName: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 5,
      });

      recentLessons = teacherLessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        date: lesson.date.toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: lesson.date.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        teacher: "Вы",
        message: lesson.notes || "Занятие завершено",
        filesCount: lesson.attachments.length,
        hasRecording: true,
        recordingUrl: lesson.youtubeLink,
        topic: lesson.topic?.name,
        groupName: lesson.group?.name,
        studentNames: lesson.students.map((s: any) => s.name).join(", "),
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
