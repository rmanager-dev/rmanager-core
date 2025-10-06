import Navbar from "./homeComponents/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="sticky top-0">
        <Navbar />
      </header>
      {children}
    </div>
  );
}
