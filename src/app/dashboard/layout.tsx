import ProtectedRoute from "@/src/components/ProtectedRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute rules={["requireLoggedIn"]} fallbackRoute="/login">
      {children}
    </ProtectedRoute>
  );
}
