import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/recordings - Get all recordings (completed lessons)
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    let lessons: any[] = [];

    if (userRole === "STUDENT") {
      // For students, get completed lessons from their enrolled groups and individual lessons
      lessons = await prisma.lesson.findMany({
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
              mimeType: true,
              size: true,
              description: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });
    } else if (userRole === "TEACHER") {
      // For teachers, get all their completed lessons
      lessons = await prisma.lesson.findMany({
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
          attachments: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              description: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });
    } else {
      // For admins, get all completed lessons
      lessons = await prisma.lesson.findMany({
        where: {
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
              mimeType: true,
              size: true,
              description: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });
    }

    // Convert lessons to the expected recording format
    const recordings = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      date: lesson.date,
      lessonType: lesson.lessonType,
      youtubeLink: lesson.youtubeLink,
      message: lesson.notes,
      isPublished: lesson.isPublished,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      duration: lesson.duration,
      viewCount: lesson.viewCount,
      averageRating: lesson.averageRating,
      totalFeedback: lesson.totalFeedback,
      teacherId: lesson.teacherId,
      groupId: lesson.groupId,
      group: lesson.group,
      teacher: lesson.teacher,
      topic: lesson.topic,
      attachments: lesson.attachments,
    }));

    return NextResponse.json(recordings);
  } catch (error) {
    console.error("Get recordings error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/recordings - Create a new recording (complete a lesson)
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["TEACHER", "ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const teacherId = authenticatedRequest.user.userId;

    const {
      title,
      description,
      date,
      lessonType,
      youtubeLink,
      message,
      groupId,
      studentIds,
      topicId,
      materials,
    } = await request.json();

    if (!title || !date || !lessonType || !youtubeLink) {
      return NextResponse.json(
        { error: "Title, date, lesson type, and YouTube link are required" },
        { status: 400 },
      );
    }

    // Create a new completed lesson with recording
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime: "00:00", // Default since this is a completed lesson
        endTime: "01:00", // Default since this is a completed lesson
        duration: 60, // Default duration
        status: "COMPLETED",
        lessonType,
        teacherId,
        groupId,
        topicId,
        youtubeLink,
        notes: message,
        materials: materials || [],
        isPublished: true,
        students: studentIds
          ? {
              connect: studentIds.map((id: string) => ({ id })),
            }
          : undefined,
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
          },
        },
        attachments: true,
      },
    });

    // Convert to recording format for response
    const recording = {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      date: lesson.date,
      lessonType: lesson.lessonType,
      youtubeLink: lesson.youtubeLink,
      message: lesson.notes,
      isPublished: lesson.isPublished,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      duration: lesson.duration,
      teacherId: lesson.teacherId,
      groupId: lesson.groupId,
      group: lesson.group,
      topic: lesson.topic,
      attachments: lesson.attachments,
    };

    return NextResponse.json(recording);
  } catch (error) {
    console.error("Create recording error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
