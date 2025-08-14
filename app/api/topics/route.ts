import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/topics - Get all topics with course information
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const whereClause: any = { isActive: true };

    if (courseId) {
      whereClause.courseId = courseId;
    }

    const topics = await prisma.topic.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
      orderBy: [{ courseId: "asc" }, { order: "asc" }],
    });

    const formattedTopics = topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      order: topic.order,
      course: topic.course,
    }));

    return NextResponse.json(formattedTopics);
  } catch (error) {
    console.error("Get topics error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/topics - Create a new topic (Admin/Teacher only)
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const { name, description, order, courseId } = body;

    if (!name || !courseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // If no order specified, get the next order number
    let topicOrder = order;

    if (!topicOrder) {
      const lastTopic = await prisma.topic.findFirst({
        where: { courseId },
        orderBy: { order: "desc" },
      });

      topicOrder = (lastTopic?.order || 0) + 1;
    }

    const topic = await prisma.topic.create({
      data: {
        name,
        description,
        order: topicOrder,
        courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error("Create topic error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
