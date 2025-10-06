import { Button } from "@/src/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomepageHeader() {
  return (
    <div className="w-full flex flex-col items-center gap-6 text-center">
      <h1 className="text-foreground text-balance text-5xl lg:text-7xl font-semibold max-w-4xl">
        Manage Your Roblox Deployments with Ease
      </h1>
      <p className="text-foreground text-balance text-sm lg:text-xl max-w-3xl">
        rManager lets you create isolated environments where you can schedule
        releases, restrict access and automate luau tasks. Everything for free,
        everything Open Source.
      </p>
      <div className="flex justify-center w-full">
        <Button size={"lg"} asChild>
          <Link href={"/signup"}>
            Get Started
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
