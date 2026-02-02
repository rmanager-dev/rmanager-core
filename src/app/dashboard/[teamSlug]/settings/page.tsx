"use client";
import TeamDangerZone from "./TeamDangerZone";
import TeamDisplayName from "./TeamDisplayName";
import TeamName from "./TeamName";

export default function Page() {
  return (
    <>
      <span className="w-full text-left text-lg font-semibold">
        Team Settings
      </span>
      <TeamDisplayName />
      <TeamName />
      <TeamDangerZone />
    </>
  );
}
