import HomepageFooter from "./components/HomepageFooter";
import Navbar from "./components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between min-h-dvh">
      <header className="sticky top-0 flex shrink-0">
        <Navbar />
      </header>
      <main className="flex-1 overflow-auto bg-[radial-gradient(var(--secondary),transparent_1px)] [background-size:16px_16px]">
        {children}
      </main>
      <HomepageFooter />
    </div>
  );
}
