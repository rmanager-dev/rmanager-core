import React from "react";

export default function Navbar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex backdrop-blur-3xl w-full z-40 h-18 justify-center border-b-1">
      <div className="w-full max-w-[100rem] px-5 lg:px-16 xl:px-20 flex justify-between items-center">
        {children}
      </div>
    </div>
  );
}
