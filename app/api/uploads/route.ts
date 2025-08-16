import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// POST /api/uploads - Upload files for a lesson
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["TEACHER", "ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const teacherId = authenticatedRequest.user.userId;

    const formData = await request.formData();
    const lessonId = formData.get("lessonId") as string;
    const files = formData.getAll("files") as File[];

    if (!lessonId || !files || files.length === 0) {
      return NextResponse.json(
        { error: "Lesson ID and files are required" },
        { status: 400 },
      );
    }

    // Check if the lesson exists and belongs to the teacher
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        teacherId,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found or access denied" },
        { status: 404 },
      );
    }

    // Process each file
    const attachments = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 10MB.` },
          { status: 400 },
        );
      }

      // Generate a unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}_${file.name}`;
      const path = `/uploads/${filename}`;

      // In a real application, you would save the file to disk or cloud storage
      // For now, we'll just create the database record
      const attachment = await prisma.attachment.create({
        data: {
          filename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          path,
          lessonId,
        },
      });

      attachments.push(attachment);
    }

    return NextResponse.json({
      message: "Files uploaded successfully",
      attachments,
    });
  } catch (error) {
    console.error("Upload files error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
