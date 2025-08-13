import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/students - Get all students for a teacher
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const teacherId = authenticatedRequest.user.userId;

    // Get all groups for this teacher
    const teacherGroups = await prisma.group.findMany({
      where: { teacherId },
      select: { id: true },
    });

    const groupIds = teacherGroups.map((g) => g.id);

    // Get all users with STUDENT role who are in these groups
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        groupId: { in: groupIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        avatar: true,
        groupId: true,
        group: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Get students error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const teacherId = authenticatedRequest.user.userId;

    const { name, email, level, groupId, avatar } = await request.json();

    // Validation
    if (!name || !email || !level) {
      return NextResponse.json(
        { error: "Name, email, and level are required" },
        { status: 400 },
      );
    }

    // Check if student email already exists
    const existingStudent = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // If groupId is provided, verify it belongs to the teacher
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

    // Create student (as User with STUDENT role)
    const student = await prisma.user.create({
      data: {
        name,
        email,
        password: "temporary123", // Students need a password, will be changed on first login
        role: "STUDENT",
        level,
        avatar,
        groupId: groupId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        avatar: true,
        groupId: true,
        group: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Student created successfully",
        student,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create student error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
