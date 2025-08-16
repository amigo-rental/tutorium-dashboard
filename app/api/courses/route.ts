import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/courses - Get all courses with topics
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        topics: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            groups: true,
          },
        },
      },
      orderBy: { level: "asc" },
    });

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      name: course.name,
      description: course.description,
      level: course.level,
      duration: course.duration,
      totalTopics: course.topics.length,
      totalGroups: course._count.groups,
      topics: course.topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
        description: topic.description,
        order: topic.order,
      })),
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error("Get courses error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/courses - Create a new course (Admin/Teacher only)
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const {
      name,
      description,
      level,
      duration,
      topics,
      difficulty,
      category,
      tags,
    } = body;

    if (!name || !level || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const course = await prisma.course.create({
      data: {
        name,
        description,
        level,
        duration,
        difficulty: difficulty || "BEGINNER",
        category: category || "Language",
        tags: tags || [],
        topics: {
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

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Create course error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
