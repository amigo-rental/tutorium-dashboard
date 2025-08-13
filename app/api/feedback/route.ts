import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/feedback - Get feedback for a student's lessons
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["STUDENT"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const studentId = authenticatedRequest.user.userId;

    const feedbacks = await prisma.lessonFeedback.findMany({
      where: {
        studentId,
      },
      include: {
        recording: {
          select: {
            id: true,
            date: true,
            youtubeLink: true,
            message: true,
            lessonType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Get feedback error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/feedback - Create lesson feedback
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["STUDENT"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const studentId = authenticatedRequest.user.userId;

    const { rating, comment, isAnonymous, recordingId } = await request.json();

    // Validation
    if (!rating || !recordingId) {
      return NextResponse.json(
        { error: "Rating and recording ID are required" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Check if recording exists and student has access to it
    const recording = await prisma.recording.findFirst({
      where: {
        id: recordingId,
        OR: [
          {
            students: {
              some: {
                id: studentId,
              },
            },
          },
          {
            group: {
              students: {
                some: {
                  id: studentId,
                },
              },
            },
          },
        ],
      },
    });

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found or access denied" },
        { status: 404 },
      );
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.lessonFeedback.findUnique({
      where: {
        studentId_recordingId: {
          studentId,
          recordingId,
        },
      },
    });

    if (existingFeedback) {
      // Update existing feedback
      const updatedFeedback = await prisma.lessonFeedback.update({
        where: {
          id: existingFeedback.id,
        },
        data: {
          rating,
          comment: comment || null,
          isAnonymous: isAnonymous || false,
        },
        include: {
          recording: {
            select: {
              id: true,
              date: true,
              youtubeLink: true,
              message: true,
              lessonType: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Feedback updated successfully",
        feedback: updatedFeedback,
      });
    } else {
      // Create new feedback
      const feedback = await prisma.lessonFeedback.create({
        data: {
          rating,
          comment: comment || null,
          isAnonymous: isAnonymous || false,
          studentId,
          recordingId,
        },
        include: {
          recording: {
            select: {
              id: true,
              date: true,
              youtubeLink: true,
              message: true,
              lessonType: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          message: "Feedback created successfully",
          feedback,
        },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("Create/update feedback error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/feedback - Delete lesson feedback
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await requireRole(["STUDENT"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const studentId = authenticatedRequest.user.userId;

    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get("id");

    if (!feedbackId) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 },
      );
    }

    // Check if feedback exists and belongs to the student
    const feedback = await prisma.lessonFeedback.findFirst({
      where: {
        id: feedbackId,
        studentId,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found or access denied" },
        { status: 404 },
      );
    }

    // Delete feedback
    await prisma.lessonFeedback.delete({
      where: {
        id: feedbackId,
      },
    });

    return NextResponse.json({
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Delete feedback error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
