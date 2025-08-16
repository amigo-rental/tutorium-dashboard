import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/feedback - Get feedback for a specific lesson
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 },
      );
    }

    // Check if user has access to this lesson
    const lesson = await (prisma as any).lesson.findFirst({
      where: {
        id: lessonId,
        OR: [
          // Group lesson where student is enrolled
          {
            group: {
              students: {
                some: {
                  id: userId,
                },
              },
            },
          },
          // Individual lesson where student is assigned
          {
            students: {
              some: {
                id: userId,
              },
            },
          },
          // Teacher's own lesson
          {
            teacherId: userId,
          },
        ],
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found or access denied" },
        { status: 404 },
      );
    }

    // Get feedback for this lesson
    const feedback = await (prisma as any).lessonFeedback.findMany({
      where: {
        lessonId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Get feedback error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/feedback - Create feedback for a lesson
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["STUDENT"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const studentId = authenticatedRequest.user.userId;

    const { rating, comment, isAnonymous, lessonId } = await request.json();

    if (!rating || !lessonId) {
      return NextResponse.json(
        { error: "Rating and lesson ID are required" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Check if lesson exists and student has access to it
    const lesson = await (prisma as any).lesson.findFirst({
      where: {
        id: lessonId,
        OR: [
          // Group lesson where student is enrolled
          {
            group: {
              students: {
                some: {
                  id: studentId,
                },
              },
            },
          },
          // Individual lesson where student is assigned
          {
            students: {
              some: {
                id: studentId,
              },
            },
          },
        ],
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found or access denied" },
        { status: 404 },
      );
    }

    // Check if student already provided feedback for this lesson
    const existingFeedback = await (prisma as any).lessonFeedback.findUnique({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId,
        },
      },
    });

    if (existingFeedback) {
      // Update existing feedback instead of preventing duplicates
      const updatedFeedback = await (prisma as any).lessonFeedback.update({
        where: {
          id: existingFeedback.id,
        },
        data: {
          rating,
          comment: comment || null,
          isAnonymous: isAnonymous || false,
          updatedAt: new Date(),
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
              group: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Update lesson's average rating
      await (prisma as any).lesson.update({
        where: { id: lessonId },
        data: {
          averageRating: await (prisma as any).lessonFeedback
            .aggregate({
              where: { lessonId },
              _avg: { rating: true },
            })
            .then((result: any) => result._avg.rating || 0),
        },
      });

      return NextResponse.json(updatedFeedback, { status: 200 });
    }

    // Create new feedback if none exists
    const feedback = await (prisma as any).lessonFeedback.create({
      data: {
        rating,
        comment: comment || null,
        isAnonymous: isAnonymous || false,
        studentId,
        lessonId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Update lesson's average rating and total feedback count
    await (prisma as any).lesson.update({
      where: { id: lessonId },
      data: {
        totalFeedback: {
          increment: 1,
        },
        averageRating: await (prisma as any).lessonFeedback
          .aggregate({
            where: { lessonId },
            _avg: { rating: true },
          })
          .then((result: any) => result._avg.rating || 0),
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Create feedback error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/feedback - Delete feedback
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await requireRole(["STUDENT", "ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get("id");

    if (!feedbackId) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 },
      );
    }

    // Get the feedback
    const feedback = await (prisma as any).lessonFeedback.findUnique({
      where: { id: feedbackId },
      include: {
        lesson: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }

    // Check permissions
    if (userRole === "STUDENT" && feedback.studentId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the feedback
    await (prisma as any).lessonFeedback.delete({
      where: { id: feedbackId },
    });

    // Update lesson's average rating and total feedback count
    const remainingFeedback = await (prisma as any).lessonFeedback.findMany({
      where: { lessonId: feedback.lessonId },
    });

    const newAverageRating =
      remainingFeedback.length > 0
        ? remainingFeedback.reduce((sum: any, f: any) => sum + f.rating, 0) /
          remainingFeedback.length
        : 0;

    await (prisma as any).lesson.update({
      where: { id: feedback.lessonId },
      data: {
        totalFeedback: remainingFeedback.length,
        averageRating: newAverageRating,
      },
    });

    return NextResponse.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Delete feedback error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
