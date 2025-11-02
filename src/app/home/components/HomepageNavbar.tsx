"use client";
import Image from "next/image";
import Link from "next/link";

import Navbar from "@/src/components/Navbar";
import { Button } from "@/src/components/ui/button";
import UserDropdown from "@/src/components/Navbar/UserDropdown";
import { useAuth } from "@/src/hooks/useAuth";
import { Skeleton } from "@/src/components/ui/skeleton";

const GithubButton = () => {
  return (
    <Button variant={"outline"} size={"icon"} asChild>
      <Link href="https://github.com/rmanager-dev/rmanager-core">
        <Image
          alt={"Logo"}
          height="20"
          width="20"
          src="icons/github.svg"
          className="dark:invert"
        />
      </Link>
    </Button>
  );
};

const NavbarComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <Navbar>
      <div className="w-full max-w-[100rem] px-5 lg:px-16 xl:px-20 flex justify-between items-center">
        <Link href={"/home"}>
          <Image
            src={"brand/logo.svg"}
            width={80}
            height={80}
            alt="Logo"
            className="invert dark:invert-0"
          />
        </Link>
        {children}
      </div>
    </Navbar>
  );
};

export default function HomepageNavbar() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <NavbarComponent>
        <div className="flex gap-4 items-center">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      </NavbarComponent>
    );
  }

  if (!user) {
    return (
      <NavbarComponent>
        <div className="flex gap-4 items-center">
          <GithubButton />
          <Button asChild>
            <Link href={"/signup"}>Sign Up</Link>
          </Button>
          <Button variant={"outline"} asChild>
            <Link href={"/login"}>Login</Link>
          </Button>
        </div>
      </NavbarComponent>
    );
  }

  return (
    <NavbarComponent>
      <div className="flex gap-4 items-center">
        <GithubButton />
        <Button variant={"outline"} asChild>
          <Link href={"/dashboard"}>Dashboard</Link>
        </Button>
        <UserDropdown />
      </div>
    </NavbarComponent>
  );
}
