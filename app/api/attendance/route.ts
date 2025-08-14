import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;

    // Parse request body
    const { lessonId, attendance } = await request.json();

    if (!lessonId || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    // Validate attendance data
    for (const record of attendance) {
      if (!record.studentId || !record.status) {
        return NextResponse.json(
          { error: "Invalid attendance record" },
          { status: 400 },
        );
      }

      if (!["PRESENT", "ABSENT", "LATE", "EXCUSED"].includes(record.status)) {
        return NextResponse.json(
          { error: "Invalid attendance status" },
          { status: 400 },
        );
      }
    }

    // Create attendance records
    const attendanceRecords = await Promise.all(
      attendance.map(async (record) => {
        return await prisma.lessonAttendance.create({
          data: {
            lessonId,
            studentId: record.studentId,
            status: record.status,
            notes: record.notes || null,
          },
        });
      }),
    );

    return NextResponse.json({
      message: "Attendance recorded successfully",
      data: attendanceRecords,
    });
  } catch (error) {
    console.error("Error creating attendance:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER", "STUDENT"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const userId = authenticatedRequest.user.userId;

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const studentId = searchParams.get("studentId");

    if (lessonId) {
      // Get attendance for a specific lesson/recording
      const attendance = await prisma.lessonAttendance.findMany({
        where: { lessonId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      return NextResponse.json({ data: attendance });
    }

    if (studentId) {
      // Get attendance for a specific student
      const attendance = await prisma.lessonAttendance.findMany({
        where: { studentId },
        include: {
          lesson: {
            select: {
              id: true,
              lessonType: true,
              date: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ data: attendance });
    }

    return NextResponse.json(
      { error: "lessonId or studentId parameter required" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error fetching attendance:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
