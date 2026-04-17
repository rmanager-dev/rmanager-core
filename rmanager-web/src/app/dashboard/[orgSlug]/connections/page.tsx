"use client";
import { DataTable } from "@/src/components/DataTable";
import { useDatabases } from "@/src/hooks/useDatabase";
import { databaseColumn } from "./DatabaseColumn";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import LinkDatabaseDialog from "./LinkDialog/LinkDatabaseDialog";
import { robloxCredentialColumn } from "./RobloxCredentialColumn";
import LinkRobloxCredentialDialog from "./LinkRoCredDialog";
import { useRobloxCredentials } from "@/src/hooks/useRobloxCredential";
import { useRouter } from "next/navigation";
import { useOrg, usePermissions } from "@/src/hooks/useOrg";

export default function Page() {
  const [isLinkDbOpen, setIsLinkDbOpen] = useState(false);
  const [isLinkCredOpen, setIsLinkCredOpen] = useState(false);
  const { data: dbData, isLoading: isDbLoading } = useDatabases();
  const { data: credData, isLoading: isCredLoading } = useRobloxCredentials();
  const permissions = usePermissions({
    canLinkDb: { database: ["create"] },
    canLinkCred: { roblox_credential: ["create"] },
  });

  return (
    <>
      <span className="w-full text-left text-lg font-semibold">Connections</span>
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
              disabled={!permissions?.canLinkDb}
            >
              <Plus />
              <span>Link Database</span>
            </Button>
          }
        />
      </div>
      <LinkDatabaseDialog open={isLinkDbOpen} onOpenChange={setIsLinkDbOpen} />
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
              disabled={!permissions?.canLinkCred}
            >
              <Plus />
              <span>Link Roblox Credential</span>
            </Button>
          }
        />
      </div>
      <LinkRobloxCredentialDialog open={isLinkCredOpen} setIsOpen={setIsLinkCredOpen} />
    </>
  );
}
