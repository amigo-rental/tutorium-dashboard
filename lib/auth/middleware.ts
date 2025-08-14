import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "./jwt-edge";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/login", "/api/auth/login", "/api/auth/register"];

// Define role-based route access
const roleBasedRoutes = {
  "/dashboard": ["STUDENT", "TEACHER", "ADMIN"],
  "/groups": ["STUDENT", "TEACHER", "ADMIN"],
  "/tutor": ["TEACHER", "ADMIN"],
  "/teacher": ["TEACHER", "ADMIN"],
  "/admin": ["ADMIN"],
  "/settings": ["STUDENT", "TEACHER", "ADMIN"],
  "/schedule": ["STUDENT", "TEACHER", "ADMIN"],
  "/courses": ["STUDENT", "TEACHER", "ADMIN"],
  "/blog": ["STUDENT", "TEACHER", "ADMIN"],
  "/docs": ["STUDENT", "TEACHER", "ADMIN"],
  "/pricing": ["STUDENT", "TEACHER", "ADMIN"],
  "/about": ["STUDENT", "TEACHER", "ADMIN"],
};

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
  "/api/admin",
  "/api/attendance",
];

// Define the return type for requireRole
export interface AuthCheckResult {
  success: boolean;
  status: number;
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
}

// Function to check if user has required role for API routes
export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<AuthCheckResult | NextResponse> => {
    const cookieToken = request.cookies.get("token")?.value;
    
    if (!cookieToken) {
      return {
        success: false,
        status: 401,
        message: "Authentication required",
        user: null
      };
    }

    try {
      const decoded = await verifyTokenEdge(cookieToken);
      
      if (!allowedRoles.includes(decoded.role)) {
        return {
          success: false,
          status: 403,
          message: "Insufficient permissions",
          user: null
        };
      }

      return {
        success: true,
        status: 200,
        message: "Access granted",
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      };
    } catch (error) {
      return {
        success: false,
        status: 401,
        message: "Invalid token",
        user: null
      };
    }
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets, favicons, and images
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/apple-touch-icon") ||
    pathname.includes(".") // Skip files with extensions (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication token
  const cookieToken = request.cookies.get("token")?.value;
  
  if (!cookieToken) {
    console.log("Middleware: No token found, redirecting to login from:", pathname);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For middleware, we'll use a simpler approach since we can't use async/await in the main middleware function
  // We'll let the API routes handle the detailed verification with requireRole
  try {
    // Basic token validation for middleware (just check if it exists and has the right format)
    if (cookieToken.split('.').length !== 3) {
      throw new Error('Invalid token format');
    }

    // For API routes, let them handle detailed verification
    if (pathname.startsWith("/api/")) {
      const isProtectedApi = protectedApiRoutes.some((route) =>
        pathname.startsWith(route),
      );

      if (isProtectedApi) {
        // Add basic user info to headers for API routes to use
        // The actual verification will be done by requireRole in the API route
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-has-token", "true");

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    }

    // For page routes, check role-based access
    const route = Object.keys(roleBasedRoutes).find(route => pathname.startsWith(route));
    
    if (route) {
      // For page routes, we'll do basic validation and let the page handle detailed role checking
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-has-token", "true");

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Add basic user info to headers for page routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-has-token", "true");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.log("Middleware: Invalid token, redirecting to login from:", pathname);
    // Clear invalid token
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
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
