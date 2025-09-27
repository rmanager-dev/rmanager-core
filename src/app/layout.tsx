import "@/src/app/globals.css";
import { ThemeProvider } from "next-themes";
import ThemedToaster from "../components/ThemedToaster";
import AuthProvider from "../components/AuthProvider";

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
          <AuthProvider>
            <main className="h-screen">{children}</main>
            <ThemedToaster position="top-center" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
