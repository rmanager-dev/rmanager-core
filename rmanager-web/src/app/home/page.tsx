import FeatureCards from "./components/FeatureCards";
import HomepageHeader from "./components/HomepageHeader";

export default function Page() {
  return (
    <div className="h-full w-full my-15 px-5 sm:px-10 flex flex-col items-center gap-20 overflow-hidden">
      <HomepageHeader />
      <FeatureCards />
    </div>
  );
}
