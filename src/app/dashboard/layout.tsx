import ProtectedRoute from "@/src/components/ProtectedRoute";
import DashboardNavbar from "./components/DashboardNavbar";
import { SidebarProvider } from "@/src/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute rules={["requireLoggedIn"]} fallbackRoute="/login">
      <SidebarProvider className="flex flex-col min-h-screen">
        <header className="sticky top-0 flex shrink-0 z-40">
          <DashboardNavbar />
        </header>
        <div className="flex-1 flex overflow-hidden">{children}</div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
