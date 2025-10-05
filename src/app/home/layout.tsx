import Navbar from "./homeComponents/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-col min-h-screen">
      {/* Sidebar */}
      <header className="sticky top-0">
        <Navbar />
      </header>
      {children}
    </div>
  );
}
