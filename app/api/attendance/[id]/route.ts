import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// PUT /api/attendance/[id] - Update attendance record (Admin/Teacher only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await context.params;
    const body = await request.json();
    const { status, notes } = body;

    if (!status || !["PRESENT", "ABSENT", "LATE", "EXCUSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check if attendance record exists
    const existingAttendance = await prisma.lessonAttendance.findUnique({
      where: { id },
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    // Update attendance record
    const updatedAttendance = await prisma.lessonAttendance.update({
      where: { id },
      data: {
        status,
        notes,
      },
    });

    return NextResponse.json(updatedAttendance);
  } catch (error) {
    console.error("Update attendance error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/attendance/[id] - Delete attendance record (Admin/Teacher only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const { id } = await context.params;

    // Check if attendance record exists
    const existingAttendance = await prisma.lessonAttendance.findUnique({
      where: { id },
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 },
      );
    }

    // Delete attendance record
    await prisma.lessonAttendance.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Delete attendance error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
