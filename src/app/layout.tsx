import "@/src/app/globals.css";
import { ThemeProvider } from "next-themes";
import ThemedToaster from "../components/toaster/ThemedToaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="h-screen">{children}</main>
          <ThemedToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
