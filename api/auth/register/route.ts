import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { hashPassword, generateToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = "TEACHER" } = await request.json();

    // Debug logging
    console.log("Registration attempt:", {
      name,
      email,
      role,
      password: password ? "[REDACTED]" : "undefined",
    });

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // Validate role
    const validRoles = ["ADMIN", "TEACHER", "STUDENT"];

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    console.log("Creating user with data:", {
      name,
      email,
      role,
      hashedPassword: hashedPassword ? "[REDACTED]" : "undefined",
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    console.log("User created successfully:", {
      id: user.id,
      name: user.name,
      role: user.role,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      message: "User created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Check for specific Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      console.error("Prisma error code:", (error as any).code);
      console.error("Prisma error meta:", (error as any).meta);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
