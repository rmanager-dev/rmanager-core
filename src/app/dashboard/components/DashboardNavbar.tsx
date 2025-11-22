import Navbar from "@/src/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import UserDropdown from "@/src/components/Navbar/UserDropdown";
import { SidebarTrigger } from "@/src/components/ui/sidebar";

export default function DashboardNavbar() {
  return (
    <Navbar className="h-14">
      <div className="w-full flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <Link href={"/dashboard"}>
            <Image
              src={"/brand/logo.svg"}
              width={60}
              height={60}
              alt="Logo"
              className="invert dark:invert-0"
            />
          </Link>
        </div>
        <UserDropdown triggerProps={{ className: "rounded-full" }} />
      </div>
    </Navbar>
  );
}
