import HomepageFeatureCards from "./homeComponents/FeatureCards";
import HomepageHeader from "./homeComponents/Header";

export default function Page() {
  return (
    <div className="bg-linear-to-b from-background to-popover min-h-screen w-full ">
      <div className="min-h-screen w-full p-20 flex flex-col items-center gap-20">
        <HomepageHeader />
        <HomepageFeatureCards />
      </div>
    </div>
  );
}
