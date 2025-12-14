import HomepageFooter from "./components/HomepageFooter";
import HomepageNavbar from "./components/HomepageNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between min-h-dvh">
      <header className="sticky top-0 flex shrink-0">
        <HomepageNavbar />
      </header>
      <main className="flex-1 overflow-auto bg-[radial-gradient(var(--secondary),transparent_1px)] bg-size-[16px_16px]">
        {children}
      </main>
      <HomepageFooter />
    </div>
  );
}
