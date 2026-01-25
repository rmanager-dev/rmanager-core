import NavigationSidebar from "@/src/components/NavigationSidebar";
import TeamSidebar from "./components/TeamSidebar";
import { SidebarInset } from "@/src/components/ui/sidebar";
import React from "react";

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <TeamSidebar />
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}
