import HomepageFeatureCards from "./components/FeatureCards";
import HomepageHeader from "./components/HeaderText";

export default function Page() {
  return (
    <div className="bg-[radial-gradient(var(--secondary),transparent_1px)] [background-size:16px_16px] h-full w-full">
      <div className="min-h-screen w-full p-20 flex flex-col items-center gap-20">
        <HomepageHeader />
        <HomepageFeatureCards />
      </div>
    </div>
  );
}
