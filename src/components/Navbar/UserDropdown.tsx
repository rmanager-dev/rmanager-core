"use client";
import {
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  SunMoon,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut } from "firebase/auth";
import { Skeleton } from "../ui/skeleton";
import React from "react";
import { authClient } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";

export default function UserDropdown({
  triggerProps,
}: {
  triggerProps?: React.ComponentProps<typeof Button>;
}) {
  const { data, isPending } = authClient.useSession();
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  if (isPending || !data) {
    return <Skeleton className="size-8" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} size={"icon"} {...triggerProps}>
          <User />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex gap-1 items-center">
            <User size={16} /> {data.user.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={"/dashboard"}>
              <LayoutDashboard />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={"/dashboard/user/preferences"}>
              <Settings />
              <span>Account Preferences</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <Sun />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <SunMoon />
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            authClient.signOut({
              fetchOptions: { onSuccess: () => router.push("/home") },
            })
          }
        >
          <LogOut />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
