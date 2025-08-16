import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// PUT /api/admin/users/[id] - Update user (admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await context.params;
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      role,
      groupId,
      level,
      isActive,
      courseIds,
    } = body;

    // Validate user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
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

    // Prepare update data
    const updateData: any = {};

    if (firstName && lastName) {
      updateData.name = `${firstName} ${lastName}`;
    }
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (groupId !== undefined) updateData.groupId = groupId || null;
    if (level !== undefined) updateData.level = level || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle course enrollments if provided
    if (courseIds !== undefined) {
      if (Array.isArray(courseIds)) {
        // Validate all course IDs exist
        const existingCourses = await prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true },
        });

        if (existingCourses.length !== courseIds.length) {
          return NextResponse.json(
            { error: "One or more course IDs are invalid" },
            { status: 400 },
          );
        }

        updateData.enrolledCourses = {
          set: courseIds.map((courseId: string) => ({ id: courseId })),
        };
      } else {
        updateData.enrolledCourses = {
          set: [],
        };
      }
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        group: {
          select: {
            id: true,
            name: true,
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

    // Calculate average rating from lesson feedback
    const feedbacks = await prisma.lessonFeedback.findMany({
      where: { studentId: id },
      select: { rating: true },
    });

    const averageRating =
      feedbacks.length > 0
        ? feedbacks.reduce(
            (sum: number, fb: { rating: number }) => sum + fb.rating,
            0,
          ) / feedbacks.length
        : null;

    const totalFeedbacks = feedbacks.length;

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      ...userWithoutPassword,
      averageRating,
      totalFeedbacks,
    });
  } catch (error) {
    console.error("Update user error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await context.params;

    // Validate user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting the last admin
    if (existingUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last admin user" },
          { status: 400 },
        );
      }
    }

    // Delete the user (this will cascade to related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
