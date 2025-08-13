import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/recordings - Get all recordings for a teacher
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const teacherId = authenticatedRequest.user.userId;

    const recordings = await prisma.recording.findMany({
      where: {
        teacherId,
      },
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
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(recordings);
  } catch (error) {
    console.error("Get recordings error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/recordings - Create a new recording
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const teacherId = authenticatedRequest.user.userId;

    const { lessonType, date, youtubeLink, message, groupId, studentIds } =
      await request.json();

    // Debug logging
    console.log("Received recording data:", {
      lessonType,
      date,
      youtubeLink,
      message,
      groupId,
      studentIds,
    });

    // Validation
    if (!lessonType || !date || !youtubeLink) {
      return NextResponse.json(
        { error: "Lesson type, date, and YouTube link are required" },
        { status: 400 },
      );
    }

    // Validate date format
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
    }

    // Validate lesson type
    if (!["GROUP", "INDIVIDUAL"].includes(lessonType)) {
      return NextResponse.json(
        { error: "Invalid lesson type" },
        { status: 400 },
      );
    }

    // If it's a group lesson, groupId is required
    if (
      lessonType === "GROUP" &&
      (groupId === undefined || groupId === null || groupId === "")
    ) {
      return NextResponse.json(
        { error: "Group ID is required for group lessons" },
        { status: 400 },
      );
    }

    // If it's an individual lesson, studentIds are required
    if (
      lessonType === "INDIVIDUAL" &&
      (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0)
    ) {
      return NextResponse.json(
        { error: "Student IDs are required for individual lessons" },
        { status: 400 },
      );
    }

    // Verify group belongs to teacher (if provided)
    if (groupId) {
      const group = await prisma.group.findFirst({
        where: {
          id: groupId,
          teacherId,
        },
      });

      if (!group) {
        return NextResponse.json(
          { error: "Invalid group ID" },
          { status: 400 },
        );
      }
    }

    // Verify students belong to teacher's groups (if provided)
    if (studentIds && studentIds.length > 0) {
      // Get all groups for this teacher
      const teacherGroups = await prisma.group.findMany({
        where: { teacherId },
        select: { id: true },
      });

      const groupIds = teacherGroups.map((g) => g.id);

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

    // Create recording
    try {
      const recording = await prisma.recording.create({
        data: {
          lessonType: lessonType as any,
          date: new Date(date),
          youtubeLink,
          message: message || null,
          teacherId,
          groupId: groupId || null,
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

      return NextResponse.json(
        {
          message: "Recording created successfully",
          recording,
        },
        { status: 201 },
      );
    } catch (prismaError: any) {
      console.error("Prisma create error:", prismaError);

      // Handle specific Prisma validation errors
      if (prismaError.code === "P2002") {
        return NextResponse.json(
          { error: "A recording with this data already exists" },
          { status: 409 },
        );
      }

      if (prismaError.code === "P2003") {
        return NextResponse.json(
          { error: "Invalid foreign key reference" },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Failed to create recording: " + prismaError.message },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Create recording error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
