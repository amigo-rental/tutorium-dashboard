import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/groups - Get groups (all for admin, own for teacher, all for students for enrollment)
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;
    const userRole = authenticatedRequest.user.role;

    // For students and teachers, show all groups so they can browse and potentially enroll
    // Admins see all groups, Teachers see all groups (for potential student placement), Students see all groups (for enrollment)
    const whereClause = { isActive: true };

    const groups = await prisma.group.findMany({
      where: whereClause,
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
            isActive: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      "Groups API: Returning",
      groups.length,
      "groups (all active groups) for",
      userRole,
      "user:",
      userId,
    );

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Get groups error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const teacherId = authenticatedRequest.user.userId;

    const {
      name,
      description,
      level,
      maxStudents = 20,
      courseId,
    } = await request.json();

    // Validation
    if (!name || !level || !courseId) {
      return NextResponse.json(
        { error: "Name, level, and courseId are required" },
        { status: 400 },
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if group name already exists for this teacher
    const existingGroup = await prisma.group.findFirst({
      where: {
        name,
        teacherId,
      },
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: "Group with this name already exists" },
        { status: 409 },
      );
    }

    // Create group
    const group = await prisma.group.create({
      data: {
        name,
        description,
        level,
        maxStudents,
        teacherId,
        courseId,
      },
      include: {
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
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Group created successfully",
        group,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create group error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
