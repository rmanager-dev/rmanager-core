import { SidebarInset } from "@/src/components/ui/sidebar";
import React from "react";
import UserSettingsSidebar from "./components/UserSettingsSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UserSettingsSidebar />
      <SidebarInset>
        <main className="w-full overflow-auto">
          <div className="w-full px-2 py-10 md:px-10 lg:px-15 xl:px-20 flex justify-center">
            <div className="flex w-full flex-col items-center gap-6 max-w-5xl">
              {children}
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
