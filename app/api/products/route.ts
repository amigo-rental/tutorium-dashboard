import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// GET /api/products - Get all products (for admin management)
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN"])(request);
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
        _count: {
          select: {
            enrollments: true,
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
    const authCheck = await requireRole(["ADMIN"])(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const {
      type,
      name,
      description,
      groupId,
      courseId,
      teacherId,
    } = body;

    // Validate required fields
    if (!type || !name) {
      return NextResponse.json(
        { error: "Missing required fields: type and name" },
        { status: 400 },
      );
    }

    // Type-specific validation
    if (type === "GROUP" && !groupId) {
      return NextResponse.json(
        { error: "groupId is required for GROUP products" },
        { status: 400 },
      );
    }

    if (type === "COURSE" && !courseId) {
      return NextResponse.json(
        { error: "courseId is required for COURSE products" },
        { status: 400 },
      );
    }

    if (type === "INDIVIDUAL" && (!teacherId || !courseId)) {
      return NextResponse.json(
        { error: "teacherId and courseId are required for INDIVIDUAL products" },
        { status: 400 },
      );
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        type,
        name,
        description,
        groupId: type === "GROUP" ? groupId : null,
        courseId: (type === "COURSE" || type === "INDIVIDUAL") ? courseId : null,
        teacherId: type === "INDIVIDUAL" ? teacherId : null,
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
