"use client";
import { DataTable } from "@/src/components/DataTable";
import { useDatabases } from "@/src/hooks/useDatabase";
import { databaseColumn } from "./DatabaseColumn";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import LinkDatabaseDialog from "./LinkDialog/LinkDatabaseDialog";
import { hasPermission } from "@/src/lib/utils/team-utils";
import { useTeam } from "@/src/hooks/useTeam";
import { robloxCredentialColumn } from "./RobloxCredentialColumn";
import LinkRobloxCredentialDialog from "./LinkRoCredDialog";
import { useRobloxCredentials } from "@/src/hooks/useRobloxCredential";
import { useRouter } from "next/navigation";

export default function Page() {
  const [isLinkDbOpen, setIsLinkDbOpen] = useState(false);
  const [isLinkCredOpen, setIsLinkCredOpen] = useState(false);
  const router = useRouter();
  const { data: team } = useTeam();
  const { data: dbData, isLoading: isDbLoading } = useDatabases();
  const { data: credData, isLoading: isCredLoading } = useRobloxCredentials();

  useEffect(() => {
    if (!team) return;
    if (
      !hasPermission(team.role, "ListDatabases") &&
      !hasPermission(team.role, "ListRobloxCredentials")
    ) {
      router.replace(`/dashboard/${team.slug}`);
    }
  }, [team]);

  return (
    <>
      <span className="w-full text-left text-lg font-semibold">Connections</span>
      {hasPermission(team?.role, "ListDatabases") && (
        <>
          <div className="w-full mb-12">
            <span className="w-full text-left text-md font-medium">Databases</span>
            <DataTable
              columns={databaseColumn}
              data={dbData ?? []}
              emptyString="No database found"
              loading={isDbLoading}
              loadingString="Loading..."
              searchBoxPlaceholder="Search databases"
              searchBoxTarget="name"
              actionComponent={
                <Button
                  variant={"outline"}
                  onClick={() => setIsLinkDbOpen(true)}
                  disabled={!hasPermission(team?.role, "LinkDatabase")}
                >
                  <Plus />
                  <span>Link Database</span>
                </Button>
              }
            />
          </div>
          <LinkDatabaseDialog open={isLinkDbOpen} onOpenChange={setIsLinkDbOpen} />
        </>
      )}
      {hasPermission(team?.role, "ListRobloxCredentials") && (
        <>
          <div className="w-full">
            <span className="w-full text-left text-md font-medium">Roblox Credentials</span>
            <DataTable
              columns={robloxCredentialColumn}
              data={credData ?? []}
              emptyString="No Roblox credential found"
              loading={isCredLoading}
              loadingString="Loading..."
              searchBoxPlaceholder="Search Roblox credentials"
              searchBoxTarget="name"
              actionComponent={
                <Button
                  variant={"outline"}
                  onClick={() => setIsLinkCredOpen(true)}
                  disabled={!hasPermission(team?.role, "LinkRobloxCredential")}
                >
                  <Plus />
                  <span>Link Roblox Credential</span>
                </Button>
              }
            />
          </div>
          <LinkRobloxCredentialDialog open={isLinkCredOpen} setIsOpen={setIsLinkCredOpen} />
        </>
      )}
    </>
  );
}
