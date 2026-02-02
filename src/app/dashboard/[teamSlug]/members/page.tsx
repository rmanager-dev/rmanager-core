"use client";
import { DataTable } from "@/src/components/DataTable";
import { memberColumn } from "./MemberColumn";
import { useMembers } from "@/src/hooks/useMember";

export default function Page() {
  const { data: members, isLoading } = useMembers();

  return (
    <>
      <span className="w-full text-left text-lg font-semibold">Members</span>
      <DataTable
        columns={memberColumn}
        data={members ?? []}
        emptyString="No members found"
        loading={isLoading}
        searchBoxPlaceholder="Search members"
        searchBoxTarget="email"
      />
    </>
  );
}
