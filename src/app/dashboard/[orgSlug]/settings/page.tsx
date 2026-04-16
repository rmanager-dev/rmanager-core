"use client";
import OrganizationDangerZone from "./OrganizationDangerZone";
import OrganizationName from "./OrganizationName";
import OrganizationSlug from "./OrganizationSlug";

export default function Page() {
  return (
    <>
      <span className="w-full text-left text-lg font-semibold">Organization Settings</span>
      <OrganizationName />
      <OrganizationSlug />
      <OrganizationDangerZone />
    </>
  );
}
