"use client";
import { DataTable } from "@/src/components/DataTable";
import { Button } from "@/src/components/ui/button";
import { useProjects } from "@/src/hooks/useProject";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import CreateProjectDialog from "./components/CreateProjectDialog";
import { projectColumns } from "./components/ProjectColumn";
import { useParams, useRouter } from "next/navigation";
import { Project } from "@rmanager/shared/lib/types/project-types";
import { usePermissions } from "@/src/hooks/useOrg";

const CreateProjectButton = () => {
  const [open, setIsOpen] = useState(false);
  const permissions = usePermissions({ canCreateProject: { project: ["create"] } });

  return (
    <>
      <CreateProjectDialog open={open} setIsOpen={setIsOpen} />
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={!permissions?.canCreateProject}
      >
        <PlusIcon />
        <span>Create a Project</span>
      </Button>
    </>
  );
};

export default function Page() {
  const { data, isLoading } = useProjects();
  const { orgSlug } = useParams();
  const router = useRouter();

  const handleRowClick = (row: { original: Project }) => {
    router.push(`/dashboard/${orgSlug}/projects/${row.original.slug}`);
  };

  return (
    <>
      <span className="w-full text-left text-lg font-semibold">Projects</span>
      <div className="w-full mb-12">
        <DataTable
          data={data ?? []}
          columns={projectColumns}
          emptyString="No Projects"
          searchBoxPlaceholder="Search projects"
          searchBoxTarget="name"
          loading={isLoading}
          loadingString="Loading..."
          actionComponent={<CreateProjectButton />}
          onRowClick={handleRowClick}
        />
      </div>
    </>
  );
}
