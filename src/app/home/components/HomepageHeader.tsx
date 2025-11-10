import { Button } from "@/src/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomepageHeader() {
  return (
    <div className="w-full flex flex-col items-center gap-6 text-center">
      <h1 className="text-foreground text-balance text-5xl md:text-6xl lg:text-7xl font-semibold max-w-4xl">
        Manage your Roblox Deployments Easily
      </h1>
      <p className="text-foreground text-balance text-sm md:text-lg lg:text-xl max-w-3xl">
        rManager is your Vercel for Roblox: create isolated environments to
        deploy, schedule, and automate your releases easily - and much more.
        Everything for free, all open source
      </p>
      <div className="flex justify-center w-full">
        <Button size={"lg"} asChild>
          <Link href={"/sign-up"}>
            Get Started
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
