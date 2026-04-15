"use client";
import OrganizationDangerZone from "./OrganizationDangerZone";
import OrganizationName from "./OrganizationName";

export default function Page() {
  return (
    <>
      <span className="w-full text-left text-lg font-semibold">Organization Settings</span>
      <OrganizationName />
      <OrganizationDangerZone />
    </>
  );
}
