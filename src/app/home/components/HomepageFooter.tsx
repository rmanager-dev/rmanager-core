import Link from "next/link";

export default function HomepageFooter() {
  return (
    <footer className="flex p-4 justify-between items-center text-muted-foreground text-sm font-medium">
      <span>
        © 2025{" "}
        <a
          className="underline underline-offset-4 hover:text-primary"
          href="https://github.com/rmanager-dev"
        >
          rManager
        </a>
      </span>
    </footer>
  );
}
