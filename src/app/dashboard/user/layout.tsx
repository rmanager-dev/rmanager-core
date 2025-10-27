import { SidebarProvider } from "@/src/components/ui/sidebar";
import React from "react";
import UserSettingsSidebar from "./components/UserSettingsSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UserSettingsSidebar />
      <main className="w-full">{children}</main>
    </SidebarProvider>
  );
}
