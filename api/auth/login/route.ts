import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { comparePassword, generateToken } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Debug logging
    console.log("Login attempt:", {
      email,
      password: password ? "[REDACTED]" : "undefined",
    });

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user
    console.log("Looking for user with email:", email);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log(
      "User found:",
      user ? { id: user.id, name: user.name, role: user.role } : "Not found",
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
