import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "10485760"); // 10MB default

// POST /api/uploads - Upload files for a recording
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN", "TEACHER"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const authenticatedRequest = authCheck as any;
    const teacherId = authenticatedRequest.user.userId;

    const formData = await request.formData();
    const recordingId = formData.get("recordingId") as string;
    const files = formData.getAll("files") as File[];

    if (!recordingId) {
      return NextResponse.json(
        { error: "Recording ID is required" },
        { status: 400 },
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Verify recording belongs to teacher
    const recording = await prisma.recording.findFirst({
      where: {
        id: recordingId,
        teacherId,
      },
    });

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found or access denied" },
        { status: 404 },
      );
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const uploadedFiles = [];

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File ${file.name} is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          },
          { status: 400 },
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split(".").pop();
      const filename = `${timestamp}_${randomString}.${fileExtension}`;
      const filepath = join(UPLOAD_DIR, filename);

      // Save file to disk
      const bytes = await file.arrayBuffer();

      await writeFile(filepath, new Uint8Array(bytes));

      // Save file info to database
      const attachment = await prisma.attachment.create({
        data: {
          filename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          path: filepath,
          recordingId,
        },
      });

      uploadedFiles.push({
        id: attachment.id,
        filename: attachment.filename,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        size: attachment.size,
      });
    }

    return NextResponse.json(
      {
        message: "Files uploaded successfully",
        files: uploadedFiles,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("File upload error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
