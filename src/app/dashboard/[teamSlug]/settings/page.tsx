"use client";
import TeamDangerZone from "./TeamDangerZone";
import TeamName from "./TeamName";

export default function Page() {
  return (
    <>
      <span className="w-full text-left text-lg font-semibold">Team Settings</span>
      <TeamName />
      <TeamDangerZone />
    </>
  );
}
