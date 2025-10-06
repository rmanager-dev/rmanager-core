"use client";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/src/components/ui/dropdown-menu";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useAuth } from "@/src/hooks/useAuth";
import { auth } from "@/src/lib/firebase/firebaseClient";
import { revokeSessionCookie } from "@/src/lib/utils/AuthUtils";
import { signOut } from "firebase/auth";
import {
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  SunMoon,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RightOptions() {
  const { user, loading } = useAuth();
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  const logoutUser = async () => {
    signOut(auth);
    await revokeSessionCookie();
    router.push("/login");
  };

  const GithubButton = () => {
    return (
      <Button variant={"outline"} size={"icon"} asChild>
        <a href="https://github.com/rmanager-dev/rmanager-core">
          <Image
            alt={"Logo"}
            height="20"
            width="20"
            src="icons/github.svg"
            className="dark:invert"
          />
        </a>
      </Button>
    );
  };
  if (loading) {
    return (
      <div className="flex gap-4 items-center">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-8" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="flex gap-4 items-center">
        <GithubButton />
        <Button asChild>
          <Link href={"/signup"}>Sign Up</Link>
        </Button>
        <Button variant={"outline"} asChild>
          <Link href={"/login"}>Login</Link>
        </Button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex gap-4 items-center">
        <GithubButton />
        <Button variant={"outline"} asChild>
          <Link href={"/dashboard"}>Dashboard</Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"} size={"icon"}>
              <User />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex gap-1 items-center">
                <User size={16} /> {user.email}
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
                <Link href={"/account"}>
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
            <DropdownMenuItem onClick={logoutUser}>
              <LogOut />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
}
