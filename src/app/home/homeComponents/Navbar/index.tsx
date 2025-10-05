import Image from "next/image";

import RightOptions from "./RightOptions";

export default function Navbar() {
  return (
    <div className="flex bg-background w-full z-40 h-18 justify-center border-b-1">
      <div className="w-full max-w-[100rem] px-5 lg:px-16 xl:px-20 flex justify-between items-center">
        <div className="flex">
          <Image src={"brand/logo.svg"} width={80} height={80} alt="Logo" />
        </div>
        <RightOptions />
      </div>
    </div>
  );
}
