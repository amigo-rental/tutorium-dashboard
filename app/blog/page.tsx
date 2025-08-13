"use client";

import { title } from "@/components/primitives";
import { ProtectedRoute } from "@/components/protected-route";

export default function BlogPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1 className={title()}>Blog</h1>
      </div>
    </ProtectedRoute>
  );
}
