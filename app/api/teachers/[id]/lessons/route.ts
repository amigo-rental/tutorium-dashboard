import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/teachers/[id]/lessons - Get teacher lessons
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

    // Only allow teachers to see their own lessons, or admins to see any teacher's lessons
    if (userRole === "TEACHER" && userId !== id) {
      return NextResponse.json(
        { error: "Unauthorized to view other teacher lessons" },
        { status: 403 },
      );
    }

    const teacherId = id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build where clause
    const whereClause: any = {
      teacherId: teacherId,
      isActive: true,
    };

    if (status) {
      whereClause.status = status;
    }

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      include: {
        group: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            students: true,
            feedbacks: true,
          },
        },
        feedbacks: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 20, // Limit to recent 20 lessons
    });

    const formattedLessons = lessons.map((lesson: any) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      date: lesson.date,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      duration: lesson.duration,
      lessonType: lesson.lessonType,
      status: lesson.status,
      isActive: lesson.isActive,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      teacherId: lesson.teacherId,
      groupId: lesson.groupId,
      topicId: lesson.topicId,
      group: lesson.group,
      topic: lesson.topic,
      studentCount: lesson._count.students,
      feedbackCount: lesson._count.feedbacks,
      feedbacks: lesson.feedbacks,
      averageRating:
        lesson.feedbacks.length > 0
          ? Math.round(
              (lesson.feedbacks.reduce(
                (sum: number, f: any) => sum + f.rating,
                0,
              ) /
                lesson.feedbacks.length) *
                10,
            ) / 10
          : 0,
    }));

    return NextResponse.json(formattedLessons);
  } catch (error) {
    console.error("Get teacher lessons error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
