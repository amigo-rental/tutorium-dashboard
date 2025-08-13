"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/context";
import { DashboardLayout } from "./dashboard-layout";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { token, user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Routes that should not have the dashboard layout
  const publicRoutes = ["/login", "/"];

  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthenticated = token && user;

  // Ensure component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return <>{children}</>;
  }

  // Show loading while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If it's a public route, render without dashboard layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For authenticated users on protected routes, use dashboard layout
  if (isAuthenticated) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // For unauthenticated users, render without layout (middleware will redirect)
  return <>{children}</>;
}
