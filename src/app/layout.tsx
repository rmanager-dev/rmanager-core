import "@/src/app/globals.css";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="h-screen">{children}</main>
      </body>
    </html>
  );
}
