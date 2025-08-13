import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/groups - Get all groups for a teacher
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const teacherId = authenticatedRequest.user.userId;

    const groups = await prisma.group.findMany({
      where: {
        teacherId,
        isActive: true,
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
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

    const { name, description, level, maxStudents = 20 } = await request.json();

    // Validation
    if (!name || !level) {
      return NextResponse.json(
        { error: "Name and level are required" },
        { status: 400 },
      );
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
      },
      include: {
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
