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

    // Validation
    if (!lessonType || !date || !youtubeLink) {
      return NextResponse.json(
        { error: "Lesson type, date, and YouTube link are required" },
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
    if (lessonType === "GROUP" && !groupId) {
      return NextResponse.json(
        { error: "Group ID is required for group lessons" },
        { status: 400 },
      );
    }

    // If it's an individual lesson, studentIds are required
    if (
      lessonType === "INDIVIDUAL" &&
      (!studentIds || studentIds.length === 0)
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
          groupId: { in: groupIds },
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
    const recording = await prisma.recording.create({
      data: {
        lessonType: lessonType as any,
        date: new Date(date),
        youtubeLink,
        message,
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
  } catch (error) {
    console.error("Create recording error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
