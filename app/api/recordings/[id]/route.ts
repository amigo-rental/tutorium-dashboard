import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/recordings/[id] - Get a specific recording (completed lesson)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    // Get the lesson/recording
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: id,
        status: "COMPLETED",
        youtubeLink: {
          not: null,
        },
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            level: true,
            students: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
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
            email: true,
            level: true,
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
            createdAt: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }

    // Check access permissions
    if (userRole === "STUDENT") {
      // Students can only access recordings from their enrolled groups or individual lessons
      const hasAccess =
        (lesson.groupId &&
          lesson.group?.students?.some((s) => s.id === userId)) ||
        lesson.students?.some((s) => s.id === userId);

      if (!hasAccess) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (userRole === "TEACHER") {
      // Teachers can only access their own recordings
      if (lesson.teacherId !== userId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }
    // Admins can access all recordings

    // Convert lesson to recording format for response
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
      viewCount: lesson.viewCount,
      averageRating: lesson.averageRating,
      totalFeedback: lesson.totalFeedback,
      teacherId: lesson.teacherId,
      groupId: lesson.groupId,
      group: lesson.group,
      teacher: lesson.teacher,
      topic: lesson.topic,
      students: lesson.students,
      attachments: lesson.attachments,
    };

    return NextResponse.json(recording);
  } catch (error) {
    console.error("Get recording error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/recordings/[id] - Update a recording (completed lesson)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authCheck = await requireRole(["TEACHER", "ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const teacherId = authenticatedRequest.user.userId;

    // Check if the lesson exists and belongs to the teacher
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: id,
        teacherId,
        status: "COMPLETED",
      },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Recording not found or access denied" },
        { status: 404 },
      );
    }

    const { title, description, youtubeLink, message, isPublished, materials } =
      await request.json();

    // Update the lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id: id },
      data: {
        title: title || undefined,
        description: description || undefined,
        youtubeLink: youtubeLink || undefined,
        notes: message || undefined,
        isPublished: isPublished !== undefined ? isPublished : undefined,
        materials: materials || undefined,
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
      id: updatedLesson.id,
      title: updatedLesson.title,
      description: updatedLesson.description,
      date: updatedLesson.date,
      lessonType: updatedLesson.lessonType,
      youtubeLink: updatedLesson.youtubeLink,
      message: updatedLesson.notes,
      isPublished: updatedLesson.isPublished,
      createdAt: updatedLesson.createdAt,
      updatedAt: updatedLesson.updatedAt,
      duration: updatedLesson.duration,
      teacherId: updatedLesson.teacherId,
      groupId: updatedLesson.groupId,
      group: updatedLesson.group,
      topic: updatedLesson.topic,
      attachments: updatedLesson.attachments,
    };

    return NextResponse.json(recording);
  } catch (error) {
    console.error("Update recording error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/recordings/[id] - Delete a recording (completed lesson)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authCheck = await requireRole(["TEACHER", "ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const teacherId = authenticatedRequest.user.userId;

    // Check if the lesson exists and belongs to the teacher
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: id,
        teacherId,
        status: "COMPLETED",
      },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Recording not found or access denied" },
        { status: 404 },
      );
    }

    // Delete the lesson (this will cascade to attachments, feedback, and attendance)
    await prisma.lesson.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Recording deleted successfully" });
  } catch (error) {
    console.error("Delete recording error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
