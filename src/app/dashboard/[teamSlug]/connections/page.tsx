"use client";
import { DataTable } from "@/src/components/DataTable";
import { useDatabases } from "@/src/hooks/useDatabase";
import { databaseColumn } from "./DatabaseColumn";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import LinkDatabaseDialog from "./LinkDialog/LinkDatabaseDialog";
import { hasPermission } from "@/src/lib/utils/team-utils";
import { useTeam } from "@/src/hooks/useTeam";

export default function Page() {
  const [open, setIsOpen] = useState(false);
  const { data: team } = useTeam();
  const { data, isLoading } = useDatabases();

  return (
    <>
      <span className="w-full text-left text-lg font-semibold">
        Connections
      </span>
      <span className="w-full text-left text-md font-medium">Databases</span>
      <DataTable
        columns={databaseColumn}
        data={data ?? []}
        emptyString="No database found"
        loading={isLoading}
        loadingString="Loading..."
        searchBoxPlaceholder="Search databases"
        searchBoxTarget="name"
        actionComponent={
          <Button
            variant={"outline"}
            onClick={() => setIsOpen(true)}
            disabled={!hasPermission(team?.role, "LinkDatabase")}
          >
            <Plus />
            <span>Link Database</span>
          </Button>
        }
      />
      <LinkDatabaseDialog open={open} onOpenChange={setIsOpen} />
    </>
  );
}
