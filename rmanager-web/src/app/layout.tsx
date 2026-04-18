import "@/src/app/globals.css";
import { ThemeProvider } from "next-themes";
import ThemedToaster from "@/src/components/ThemedToaster";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Metadata } from "next";
import QueryClientWrapper from "@/src/components/QueryClientWrapper";

export const metadata: Metadata = {
  title: "rManager",
  description: "Manage your roblox deployments easily",
  generator: "Next.js",
  creator: "OverDsh",
  publisher: "rmanager-dev",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="rManager" />
      </head>
      <QueryClientWrapper>
        <body className="font-sans">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="min-h-dvh">{children}</main>
            <ThemedToaster position="bottom-right" closeButton richColors />
          </ThemeProvider>
        </body>
      </QueryClientWrapper>
    </html>
  );
}
