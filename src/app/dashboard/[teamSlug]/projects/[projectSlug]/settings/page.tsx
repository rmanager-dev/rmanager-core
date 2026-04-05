import ProjectDangerZone from "./ProjectDangerZone";
import ProjectName from "./ProjectName";

export default function Page() {
  return (
    <>
      <span className="w-full text-left text-lg font-semibold">Project Settings</span>
      <ProjectName />
      <ProjectDangerZone />
    </>
  );
}
