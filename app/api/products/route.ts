import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/products - Get all products (for admin management)
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            level: true,
            description: true,
          },
        },
        _count: {
          select: {
            studentEnrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN"])(
      request,
    );

    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const {
      name,
      type,
      description,
      courseId,
      maxLessons,
      validityDays,
      price,
    } = body;

    // Validate required fields
    if (!name || !type || !courseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        type,
        description,
        courseId,
        maxLessons,
        validityDays,
        price,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            level: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Create product error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
