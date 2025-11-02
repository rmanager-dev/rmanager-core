import React from "react";
import { cn } from "@/src/lib/utils";

export default function Navbar({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex backdrop-blur-3xl w-full z-40 h-18 justify-center border-b-1",
        className
      )}
    >
      {children}
    </div>
  );
}
