import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/students/[id] - Get a specific student
export async function GET(
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

    const student = await prisma.user.findUnique({
      where: {
        id: id,
        role: "STUDENT",
      },
      include: {
        group: {
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
          },
        },
        enrolledCourses: {
          select: {
            id: true,
            name: true,
            level: true,
            description: true,
          },
        },
        feedbacks: {
          include: {
            lesson: {
              select: {
                id: true,
                date: true,
                lessonType: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        attendance: {
          include: {
            lesson: {
              select: {
                id: true,
                date: true,
                lessonType: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check access permissions for teachers
    if (userRole === "TEACHER") {
      // Teacher can only see students from their groups
      if (!student.group || student.group.teacher.id !== userId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Remove password from response
    const { password, ...studentWithoutPassword } = student;

    return NextResponse.json(studentWithoutPassword);
  } catch (error) {
    console.error("Get student error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/students/[id] - Update a student
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

    const { name, email, level, groupId, avatar, isActive } =
      await request.json();

    const { id } = await context.params;

    // Check if student exists
    const existingStudent = await prisma.user.findUnique({
      where: {
        id: id,
        role: "STUDENT",
      },
      include: {
        group: {
          select: {
            teacherId: true,
          },
        },
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check permissions for teachers
    if (userRole === "TEACHER") {
      // Teacher can only update students from their groups
      if (
        !existingStudent.group ||
        existingStudent.group.teacherId !== userId
      ) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // If teacher wants to move student to different group, verify they own that group too
      if (groupId && groupId !== existingStudent.groupId) {
        const targetGroup = await prisma.group.findFirst({
          where: {
            id: groupId,
            teacherId: userId,
          },
        });

        if (!targetGroup) {
          return NextResponse.json(
            { error: "Invalid group ID or access denied" },
            { status: 400 },
          );
        }
      }
    }

    // Check if email is already taken by another user
    if (email && email !== existingStudent.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 },
        );
      }
    }

    // If groupId is provided, verify it exists
    if (groupId && groupId !== existingStudent.groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      // Check if group has space for new student
      const currentStudentCount = await prisma.user.count({
        where: {
          groupId: groupId,
          role: "STUDENT",
        },
      });

      if (currentStudentCount >= group.maxStudents) {
        return NextResponse.json(
          { error: "Group is at maximum capacity" },
          { status: 400 },
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (level !== undefined) updateData.level = level;
    if (groupId !== undefined) updateData.groupId = groupId || null;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update student
    const updatedStudent = await prisma.user.update({
      where: { id: id },
      data: updateData,
      include: {
        group: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    // Remove password from response
    const { password, ...studentWithoutPassword } = updatedStudent;

    return NextResponse.json({
      message: "Student updated successfully",
      student: studentWithoutPassword,
    });
  } catch (error) {
    console.error("Update student error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/students/[id] - Delete a student
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

    // Check if student exists
    const existingStudent = await prisma.user.findUnique({
      where: {
        id: id,
        role: "STUDENT",
      },
      include: {
        group: {
          select: {
            teacherId: true,
          },
        },
        _count: {
          select: {
            feedbacks: true,
            attendance: true,
            lessons: true,
          },
        },
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check permissions for teachers
    if (userRole === "TEACHER") {
      // Teacher can only delete students from their groups
      if (
        !existingStudent.group ||
        existingStudent.group.teacherId !== userId
      ) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Check if student has associated data
    const hasData =
      existingStudent._count.feedbacks > 0 ||
      existingStudent._count.attendance > 0 ||
      existingStudent._count.lessons > 0;

    if (hasData) {
      return NextResponse.json(
        {
          error:
            "Cannot delete student with associated data (feedback, attendance, or recordings)",
        },
        { status: 400 },
      );
    }

    // Delete student (cascade will handle related records)
    await prisma.user.delete({
      where: { id: id },
    });

    return NextResponse.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
