import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// POST /api/products/enroll - Enroll a student in a product
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const {
      studentId,
      productId,
      expiresAt,
    } = body;

    // Validate required fields
    if (!studentId || !productId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if student is already enrolled in this product
    const existingEnrollment = await prisma.studentProductEnrollment.findUnique({
      where: {
        studentId_productId: {
          studentId,
          productId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Student is already enrolled in this product" },
        { status: 400 },
      );
    }

    // Create the enrollment
    const enrollment = await prisma.studentProductEnrollment.create({
      data: {
        studentId,
        productId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("Enroll student in product error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
