import ProtectedRoute from "@/src/components/ProtectedRoute";
import DashboardNavbar from "./components/DashboardNavbar";
import { SidebarProvider } from "@/src/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute rules={["requireLoggedIn"]} fallbackRoute="/login">
      <SidebarProvider className="flex flex-col">
        <header className="sticky top-0 flex shrink-0">
          <DashboardNavbar />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
