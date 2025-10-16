import type { Metadata } from "next";
import "@/src/app/globals.css";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../components/ui/empty";
import { Search } from "lucide-react";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Not Found",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex justify-center">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant={"icon"}>
                <Search />
              </EmptyMedia>
              <EmptyTitle>404 - Not Found</EmptyTitle>
              <EmptyDescription>
                Looks like the page you want to access does not exist!
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href={"/home"} className="w-full">
                  Go Home
                </Link>
              </Button>
            </EmptyContent>
            <EmptyDescription>
              Need help?{" "}
              <a href="https://github.com/rmanager-dev/rmanager-core/issues">
                Open an issue
              </a>
            </EmptyDescription>
          </Empty>
        </ThemeProvider>
      </body>
    </html>
  );
}
