import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// POST /api/products/enroll - Enroll a student in a product
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const { studentId, productId, expiresAt } = body;

    // Validate required fields
    if (!studentId || !productId) {
      return NextResponse.json(
        { error: "Missing required fields: studentId and productId" },
        { status: 400 },
      );
    }

    // Check if student exists and is a STUDENT
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { error: "User must be a student to enroll in products" },
        { status: 400 },
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: "Product is not active" },
        { status: 400 },
      );
    }

    // Check if student is already enrolled in this product
    const existingEnrollment = await prisma.studentProduct.findUnique({
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
    const enrollment = await prisma.studentProduct.create({
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
            group: {
              select: {
                id: true,
                name: true,
                level: true,
                teacher: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
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

// DELETE /api/products/enroll - Remove a student from a product
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get("enrollmentId");

    if (!enrollmentId) {
      return NextResponse.json(
        { error: "Missing required parameter: enrollmentId" },
        { status: 400 },
      );
    }

    // Check if enrollment exists
    const enrollment = await prisma.studentProduct.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 },
      );
    }

    // Delete the enrollment
    await prisma.studentProduct.delete({
      where: { id: enrollmentId },
    });

    return NextResponse.json({ message: "Enrollment removed successfully" });
  } catch (error) {
    console.error("Remove student from product error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
