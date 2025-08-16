import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/lessons/individual - Get all individual lessons
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const teacherId = searchParams.get("teacherId");
    const courseId = searchParams.get("courseId");

    const where: any = {
      lessonType: "INDIVIDUAL",
      isActive: true,
    };

    if (studentId) {
      where.students = {
        some: { id: studentId },
      };
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (courseId) {
      where.topic = {
        courseId: courseId,
      };
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
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
        topic: {
          select: {
            id: true,
            name: true,
            course: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ data: lessons });
  } catch (error) {
    console.error("Get individual lessons error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/lessons/individual - Create a new individual lesson
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      duration,
      teacherId,
      studentIds,
      courseId,
      topicId,
      materials = [],
      notes,
    } = body;

    // Validate required fields
    if (
      !title ||
      !date ||
      !startTime ||
      !endTime ||
      !teacherId ||
      !studentIds ||
      !courseId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create the individual lesson
    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
        duration: duration || 60, // Default 60 minutes
        lessonType: "INDIVIDUAL",
        status: "SCHEDULED",
        isActive: true,
        teacherId,
        topicId,
        notes,
        materials,
        students: {
          connect: studentIds.map((id: string) => ({ id })),
        },
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        students: {
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
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      data: lesson,
      message: "Individual lesson created successfully",
    });
  } catch (error) {
    console.error("Create individual lesson error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/lessons/individual - Update an individual lesson
export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const {
      id,
      title,
      description,
      date,
      startTime,
      endTime,
      duration,
      teacherId,
      studentIds,
      courseId,
      topicId,
      materials,
      notes,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 },
      );
    }

    // Update the lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        startTime,
        endTime,
        duration,
        teacherId,
        topicId,
        notes,
        materials,
        status,
        students: studentIds
          ? {
              set: [], // Clear existing connections
              connect: studentIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        students: {
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
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      data: updatedLesson,
      message: "Lesson updated successfully",
    });
  } catch (error) {
    console.error("Update individual lesson error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/lessons/individual - Delete an individual lesson
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 },
      );
    }

    // Soft delete by setting isActive to false
    await prisma.lesson.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Delete individual lesson error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
