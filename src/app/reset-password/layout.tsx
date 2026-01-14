import ProtectedRoute from "@/src/components/ProtectedRoute";
import React from "react";

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <ProtectedRoute rules={["requireLoggedOff"]} fallbackRoute="/dashboard">
      {children}
    </ProtectedRoute>
  );
}
