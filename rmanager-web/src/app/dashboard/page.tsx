"use client";
import { organizationColumns } from "./components/OrganizationColumn";
import { DataTable } from "@/src/components/DataTable";
import { Button } from "@/src/components/ui/button";
import { PlusIcon } from "lucide-react";
import CreateOrganizationDialog from "./components/CreateOrgDialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrgs } from "@/src/hooks/useOrg";

const CreateOrganizationButton = () => {
  const [open, setIsOpen] = useState(false);
  return (
    <>
      <CreateOrganizationDialog open={open} setIsOpen={setIsOpen} />
      <Button variant={"outline"} onClick={() => setIsOpen(true)}>
        <PlusIcon />
        <span>Create an Organization</span>
      </Button>
    </>
  );
};

export default function Page() {
  const router = useRouter();
  const { data, isLoading } = useOrgs();
  return (
    <main className="w-full overflow-auto">
      <div className="w-full px-2 py-10 md:px-10 lg:px-15 xl:px-20 flex justify-center">
        <div className="container mx-auto max-w-5xl">
          <span className="w-full text-left text-lg font-semibold">
            Organizations
          </span>
          <DataTable
            data={data ?? []}
            columns={organizationColumns}
            emptyString="No Organizations"
            searchBoxPlaceholder="Search organizations"
            searchBoxTarget="name"
            loading={isLoading}
            loadingString="Loading..."
            actionComponent={<CreateOrganizationButton />}
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
