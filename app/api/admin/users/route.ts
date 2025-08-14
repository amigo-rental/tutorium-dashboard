import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// Generate secure random password
function generateSecurePassword(): string {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  // Ensure at least one character from each required type
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*";

  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    console.log("Fetching users for admin...");

    const users = await prisma.user.findMany({
      include: {
        group: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        enrolledCourses: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Users fetched successfully:", users.length);

    // Calculate average rating for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Calculate average rating from lesson feedback
        const feedbacks = await prisma.lessonFeedback.findMany({
          where: { studentId: user.id },
          select: { rating: true },
        });

        const averageRating =
          feedbacks.length > 0
            ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) /
              feedbacks.length
            : null;

        const totalFeedbacks = feedbacks.length;

        return {
          ...user,
          averageRating,
          totalFeedbacks,
        };
      }),
    );

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error("Get all users error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/admin/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireRole(["ADMIN"])(request);

    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const { name, email, role, groupId, isActive, level } = body;

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Generate secure random password
    const defaultPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as "ADMIN" | "TEACHER" | "STUDENT",
        groupId: groupId || null,
        isActive: isActive ?? true,
        level: level || null,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      ...userWithoutPassword,
      averageRating: null,
      defaultPassword, // Include for admin to share with user
    });
  } catch (error) {
    console.error("Create user error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
