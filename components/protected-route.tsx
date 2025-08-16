// ✅ FIXED: Moved router.push() calls to useEffect to prevent setState during render error
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Handle role-based access with useEffect
  useEffect(() => {
    if (user && requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate page based on user role
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "TEACHER") {
        router.push("/tutor");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, requiredRole, router]);

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Check role-based access if required
  if (requiredRole && user.role !== requiredRole) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
