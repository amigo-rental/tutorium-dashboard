"use client";

import { title } from "@/components/primitives";
import { ProtectedRoute } from "@/components/protected-route";

export default function DocsPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1 className={title()}>Docs</h1>
      </div>
    </ProtectedRoute>
  );
}
