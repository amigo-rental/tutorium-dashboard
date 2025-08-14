import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/recordings/[id] - Get a specific recording
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    const { id } = await context.params;

    const recording = await prisma.recording.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            level: true,
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
          },
        },
        feedbacks: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        attendance: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }

    // Check access permissions
    let hasAccess = false;

    if (userRole === "ADMIN") {
      hasAccess = true;
    } else if (userRole === "TEACHER" && recording.teacherId === userId) {
      hasAccess = true;
    } else if (userRole === "STUDENT") {
      // Student has access if they're in the group or directly assigned to the recording
      if (recording.groupId) {
        const student = await prisma.user.findFirst({
          where: {
            id: userId,
            groupId: recording.groupId,
          },
        });

        hasAccess = !!student;
      } else {
        // Check if student is directly assigned to this individual recording
        hasAccess = recording.students.some((student) => student.id === userId);
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(recording);
  } catch (error) {
    console.error("Get recording error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/recordings/[id] - Update a recording
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    const {
      lessonType,
      date,
      youtubeLink,
      message,
      groupId,
      studentIds,
      isPublished,
    } = await request.json();

    // Check if recording exists
    const existingRecording = await prisma.recording.findUnique({
      where: { id: await context.params },
    });

    if (!existingRecording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }

    // Check permissions - teachers can only update their own recordings
    if (userRole === "TEACHER" && existingRecording.teacherId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Validate lesson type if provided
    if (lessonType && !["GROUP", "INDIVIDUAL"].includes(lessonType)) {
      return NextResponse.json(
        { error: "Invalid lesson type" },
        { status: 400 },
      );
    }

    // Validate date format if provided
    if (date) {
      const dateObj = new Date(date);

      if (isNaN(dateObj.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format" },
          { status: 400 },
        );
      }
    }

    // If groupId is provided, verify it belongs to teacher
    if (groupId) {
      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          teacherId: userRole === "ADMIN" ? undefined : userId,
        },
      });

      if (!group) {
        return NextResponse.json(
          { error: "Invalid group ID" },
          { status: 400 },
        );
      }
    }

    // If studentIds are provided, verify they exist
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      const students = await prisma.user.findMany({
        where: {
          id: { in: studentIds },
          role: "STUDENT",
        },
      });

      if (students.length !== studentIds.length) {
        return NextResponse.json(
          { error: "One or more student IDs are invalid" },
          { status: 400 },
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (lessonType !== undefined) updateData.lessonType = lessonType;
    if (date !== undefined) updateData.date = new Date(date);
    if (youtubeLink !== undefined) updateData.youtubeLink = youtubeLink;
    if (message !== undefined) updateData.message = message;
    if (groupId !== undefined) updateData.groupId = groupId || null;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // Handle student assignments for individual lessons
    if (studentIds !== undefined) {
      if (Array.isArray(studentIds) && studentIds.length > 0) {
        updateData.students = {
          set: studentIds.map((id: string) => ({ id })),
        };
      } else {
        updateData.students = {
          set: [],
        };
      }
    }

    // Update recording
    const updatedRecording = await prisma.recording.update({
      where: { id: await context.params },
      data: updateData,
      include: {
        group: {
          select: {
            id: true,
            name: true,
            level: true,
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
          },
        },
      },
    });

    return NextResponse.json({
      message: "Recording updated successfully",
      recording: updatedRecording,
    });
  } catch (error) {
    console.error("Update recording error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/recordings/[id] - Delete a recording
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    // Check if recording exists
    const existingRecording = await prisma.recording.findUnique({
      where: { id: await context.params },
      include: {
        _count: {
          select: {
            feedbacks: true,
            attendance: true,
            attachments: true,
          },
        },
      },
    });

    if (!existingRecording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 },
      );
    }

    // Check permissions - teachers can only delete their own recordings
    if (userRole === "TEACHER" && existingRecording.teacherId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if recording has associated data
    const hasData =
      existingRecording._count.feedbacks > 0 ||
      existingRecording._count.attendance > 0 ||
      existingRecording._count.attachments > 0;

    if (hasData) {
      return NextResponse.json(
        {
          error:
            "Cannot delete recording with associated feedback, attendance, or attachments",
        },
        { status: 400 },
      );
    }

    // Delete recording (cascade will handle related records)
    await prisma.recording.delete({
      where: { id: await context.params },
    });

    return NextResponse.json({
      message: "Recording deleted successfully",
    });
  } catch (error) {
    console.error("Delete recording error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
