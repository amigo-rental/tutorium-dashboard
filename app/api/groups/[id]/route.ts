import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/groups/[id] - Get a specific group with details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.id;
    const userRole = authenticatedRequest.user.role;

    const { id } = await context.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
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
        recordings: {
          select: {
            id: true,
            lessonType: true,
            date: true,
            youtubeLink: true,
            message: true,
            isPublished: true,
          },
          orderBy: {
            date: "desc",
          },
        },
        _count: {
          select: {
            students: true,
            recordings: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check access permissions
    if (userRole === "TEACHER" && group.teacherId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (userRole === "STUDENT") {
      const isEnrolled = group.students.some(
        (student) => student.id === userId,
      );

      if (!isEnrolled) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Get group error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/groups/[id] - Update a group
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

    const { name, description, level, maxStudents, courseId, isActive } =
      await request.json();

    // Check if group exists
    const { id } = await context.params;
    const existingGroup = await prisma.group.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check permissions - teachers can only update their own groups
    if (userRole === "TEACHER" && existingGroup.teacherId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // If courseId is provided, verify it exists
    if (courseId && courseId !== existingGroup.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 },
        );
      }
    }

    // Check if new name conflicts with existing groups for this teacher
    if (name && name !== existingGroup.name) {
      const nameConflict = await prisma.group.findFirst({
        where: {
          name,
          teacherId: existingGroup.teacherId,
          id: { not: id },
        },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: "Group with this name already exists" },
          { status: 409 },
        );
      }
    }

    // Update group
    const updatedGroup = await prisma.group.update({
      where: { id: id },
      data: {
        name,
        description,
        level,
        maxStudents,
        courseId,
        isActive,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            level: true,
            description: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Group updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("Update group error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/groups/[id] - Delete a group
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

    const { id } = await context.params;

    // Check if group exists
    const existingGroup = await prisma.group.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            recordings: true,
          },
        },
      },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check permissions - teachers can only delete their own groups
    if (userRole === "TEACHER" && existingGroup.teacherId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if group has students or recordings
    if (existingGroup._count.students > 0) {
      return NextResponse.json(
        { error: "Cannot delete group with enrolled students" },
        { status: 400 },
      );
    }

    if (existingGroup._count.recordings > 0) {
      return NextResponse.json(
        { error: "Cannot delete group with recordings" },
        { status: 400 },
      );
    }

    // Delete group
    await prisma.group.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Delete group error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
