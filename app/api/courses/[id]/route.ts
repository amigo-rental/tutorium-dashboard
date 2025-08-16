import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/courses/[id] - Get a specific course
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await context.params;

    const course = await prisma.course.findUnique({
      where: { id: id },
      include: {
        topics: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        groups: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                students: true,
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const formattedCourse = {
      id: course.id,
      name: course.name,
      description: course.description,
      level: course.level,
      duration: course.duration,
      isActive: course.isActive,
      topics: course.topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
        description: topic.description,
        order: topic.order,
      })),
      groups: course.groups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        level: group.level,
        maxStudents: group.maxStudents,
        teacher: group.teacher,
        totalStudents: group._count.students,
        totalRecordings: group._count.lessons,
      })),
    };

    return NextResponse.json(formattedCourse);
  } catch (error) {
    console.error("Get course error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/courses/[id] - Update a course (Admin/Teacher only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await context.params;
    const body = await request.json();
    const { name, description, level, duration, isActive, topics } = body;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: id },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Update course and topics
    const updatedCourse = await prisma.course.update({
      where: { id: id },
      data: {
        name,
        description,
        level,
        duration,
        isActive,
        topics: {
          deleteMany: {}, // Remove all existing topics
          create:
            topics?.map((topic: any, index: number) => ({
              name: topic.name,
              description: topic.description,
              order: index + 1,
            })) || [],
        },
      },
      include: {
        topics: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Update course error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/courses/[id] - Delete a course (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await context.params;

    // Check if course has active groups
    const courseWithGroups = await prisma.course.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: {
            groups: true,
          },
        },
      },
    });

    if (!courseWithGroups) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (courseWithGroups._count.groups > 0) {
      return NextResponse.json(
        { error: "Cannot delete course with active groups" },
        { status: 400 },
      );
    }

    // Delete course (topics will be deleted automatically due to cascade)
    await prisma.course.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
