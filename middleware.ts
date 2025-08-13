import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/lib/auth/jwt";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/api/auth/login",
  "/api/auth/register",
];

// Define API routes that require authentication
const protectedApiRoutes = [
  "/api/courses",
  "/api/feedback",
  "/api/groups",
  "/api/lessons",
  "/api/recordings",
  "/api/students",
  "/api/uploads",
  "/api/users",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Temporarily allow all routes for debugging
  // TODO: Remove this after fixing the redirect loop
  console.log("Middleware bypassed for debugging:", pathname);
  return NextResponse.next();

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication token
  const authHeader = request.headers.get("authorization");
  const cookieToken = request.cookies.get("token")?.value;
  const token = authHeader?.split(" ")[1] || cookieToken;

  console.log("Middleware:", { pathname, token: !!token, cookieToken: !!cookieToken });

  // For API routes
  if (pathname.startsWith("/api/")) {
    // Check if this is a protected API route
    const isProtectedApi = protectedApiRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtectedApi) {
      if (!token) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      try {
        verifyToken(token!); // We already checked token exists above
        return NextResponse.next();
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        );
      }
    }

    return NextResponse.next();
  }

  // For page routes, redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    verifyToken(token!); // We already checked token exists above
    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
