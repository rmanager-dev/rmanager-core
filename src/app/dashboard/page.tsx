"use client";
import { teamColumns } from "./components/TeamColumn";
import { DataTable } from "@/src/components/DataTable";
import { Button } from "@/src/components/ui/button";
import { PlusIcon } from "lucide-react";
import CreateTeamDialog from "./components/CreateTeamDialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTeams } from "@/src/hooks/useTeam";

const CreateTeamButton = () => {
  const [open, setIsOpen] = useState(false);
  return (
    <>
      <CreateTeamDialog open={open} setIsOpen={setIsOpen} />
      <Button variant={"outline"} onClick={() => setIsOpen(true)}>
        <PlusIcon />
        <span>Create a Team</span>
      </Button>
    </>
  );
};

export default function Page() {
  const router = useRouter();
  const { data, isLoading } = useTeams();
  return (
    <main className="w-full overflow-auto">
      <div className="w-full px-2 py-10 md:px-10 lg:px-15 xl:px-20 flex justify-center">
        <div className="container mx-auto max-w-5xl">
          <span className="w-full text-left text-lg font-semibold">Teams</span>
          <DataTable
            data={data ?? []}
            columns={teamColumns}
            emptyString="No Teams"
            searchBoxPlaceholder="Search teams"
            searchBoxTarget="name"
            loading={isLoading}
            loadingString="Loading..."
            actionComponent={<CreateTeamButton />}
            onRowClick={(row) => {
              const slug = row.original.slug;
              router.push(`/dashboard/${slug}`);
            }}
          />
        </div>
      </div>
    </main>
  );
}
