import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// POST /api/groups/[id]/enroll - Enroll a student in a group
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 },
      );
    }

    // Check if group exists
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

    // Check permissions - teachers can only enroll in their own groups
    if (userRole === "TEACHER" && group.teacherId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if student exists and is a student
    const student = await prisma.user.findUnique({
      where: {
        id: studentId,
        role: "STUDENT",
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if student is already enrolled in this group
    if (student.groupId === id) {
      return NextResponse.json(
        { error: "Student is already enrolled in this group" },
        { status: 409 },
      );
    }

    // Check if student is enrolled in another group
    if (student.groupId) {
      return NextResponse.json(
        { error: "Student is already enrolled in another group" },
        { status: 409 },
      );
    }

    // Check if group has space
    if (group._count.students >= group.maxStudents) {
      return NextResponse.json(
        { error: "Group is at maximum capacity" },
        { status: 400 },
      );
    }

    // Enroll student in group and course
    await prisma.$transaction(async (tx) => {
      // Update student's group
      await tx.user.update({
        where: { id: studentId },
        data: { groupId: id },
      });

      // Enroll student in the course if not already enrolled
      const existingEnrollment = await tx.user.findFirst({
        where: {
          id: studentId,
          enrolledCourses: {
            some: {
              id: group.courseId,
            },
          },
        },
      });

      if (!existingEnrollment) {
        await tx.user.update({
          where: { id: studentId },
          data: {
            enrolledCourses: {
              connect: { id: group.courseId },
            },
          },
        });
      }
    });

    // Get updated student info
    const updatedStudent = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        avatar: true,
        group: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        enrolledCourses: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Student enrolled successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Enroll student error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/groups/[id]/enroll - Unenroll a student from a group
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

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 },
      );
    }

    // Check if group exists
    const { id } = await context.params;
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check permissions - teachers can only unenroll from their own groups
    if (userRole === "TEACHER" && group.teacherId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if student exists and is enrolled in this group
    const student = await prisma.user.findUnique({
      where: {
        id: studentId,
        role: "STUDENT",
        groupId: id,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found or not enrolled in this group" },
        { status: 404 },
      );
    }

    // Check if student has attendance or feedback records
    const studentData = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        _count: {
          select: {
            attendance: true,
            feedbacks: true,
          },
        },
      },
    });

    if (
      studentData &&
      (studentData._count.attendance > 0 || studentData._count.feedbacks > 0)
    ) {
      return NextResponse.json(
        {
          error: "Cannot unenroll student with attendance or feedback records",
        },
        { status: 400 },
      );
    }

    // Unenroll student from group
    await prisma.user.update({
      where: { id: studentId },
      data: { groupId: null },
    });

    // Note: We keep course enrollment as student might be in other groups for the same course
    // or might want to re-enroll later

    return NextResponse.json({
      message: "Student unenrolled successfully",
    });
  } catch (error) {
    console.error("Unenroll student error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
