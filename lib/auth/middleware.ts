import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "./jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  request: NextRequest,
): Promise<AuthenticatedRequest> => {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Access token required");
  }

  try {
    const decoded = verifyToken(token);

    (request as AuthenticatedRequest).user = decoded;

    return request as AuthenticatedRequest;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return async (request: NextRequest) => {
    try {
      const authenticatedRequest = await authenticateToken(request);
      const user = (authenticatedRequest as AuthenticatedRequest).user;

      if (!user || !allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 },
        );
      }

      return authenticatedRequest;
    } catch (error) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
  };
};
