import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/groups/[id] - Get a specific group with progress calculation
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

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
            email: true,
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

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Calculate real progress based on completed topics
    const totalTopics = await prisma.topic.count({
      where: {
        courseId: group.courseId,
        isActive: true,
      },
    });

    let progressPercent = 0;
    let completedTopics = 0;
    let lastStudiedTopic = null;

    if (totalTopics > 0) {
      // Get completed lessons with topics for this group
      const completedLessons = await prisma.lesson.findMany({
        where: {
          groupId: id,
          topicId: { not: null },
          status: "COMPLETED",
        },
        include: {
          topic: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      // Get unique completed topic IDs
      const completedTopicIds = Array.from(
        new Set(completedLessons.map((lesson) => lesson.topicId)),
      ).filter(Boolean);

      completedTopics = completedTopicIds.length;
      progressPercent = Math.round((completedTopics / totalTopics) * 100);

      // Get the last studied topic
      if (completedLessons.length > 0) {
        lastStudiedTopic = completedLessons[0].topic?.name || null;
      }
    }

    return NextResponse.json({
      ...group,
      progress: {
        percent: progressPercent,
        completedTopics,
        totalTopics,
        lastStudiedTopic,
      },
    });
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
            lessons: true,
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

    if (existingGroup._count.lessons > 0) {
      return NextResponse.json(
        { error: "Cannot delete group with lessons" },
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
