import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/topics/[id] - Get a specific topic
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

    const topic = await prisma.topic.findUnique({
      where: { id: id },
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

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error("Get topic error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/topics/[id] - Update a topic (Admin/Teacher only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const { name, description, order, isActive } = body;

    const { id } = await context.params;

    // Check if topic exists
    const existingTopic = await prisma.topic.findUnique({
      where: { id: id },
    });

    if (!existingTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Update topic
    const updatedTopic = await prisma.topic.update({
      where: { id: id },
      data: {
        name,
        description,
        order,
        isActive,
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

    return NextResponse.json(updatedTopic);
  } catch (error) {
    console.error("Update topic error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/topics/[id] - Delete a topic (Admin/Teacher only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await context.params;

    // Check if topic exists
    const existingTopic = await prisma.topic.findUnique({
      where: { id: id },
    });

    if (!existingTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Delete topic
    await prisma.topic.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error("Delete topic error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
