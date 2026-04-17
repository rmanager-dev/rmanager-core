"use client";
import { DataTable } from "@/src/components/DataTable";
import { memberColumn } from "./MemberColumn";
import { useOrg } from "@/src/hooks/useOrg";

export default function Page() {
  const { data: org, isLoading } = useOrg();

  return (
    <>
      <span className="w-full text-left text-lg font-semibold">Members</span>
      <DataTable
        columns={memberColumn}
        data={org?.members ?? []}
        emptyString="No members found"
        loading={isLoading}
        searchBoxPlaceholder="Search members"
        searchBoxTarget="email"
      />
    </>
  );
}
