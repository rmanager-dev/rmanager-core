"use client";
import CallbackDialog from "@/src/components/CallbackDialog";
import { Button } from "@/src/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/components/ui/item";
import { Separator } from "@/src/components/ui/separator";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useOrg, usePermissions } from "@/src/hooks/useOrg";
import { useProject, useProjectMutations } from "@/src/hooks/useProject";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const CardComponent = ({ children }: React.PropsWithChildren) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>DANGER ZONE</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <Item variant={"outline"} className="border-destructive bg-destructive/5">
          <ItemMedia variant={"icon"} className="border-none bg-destructive">
            <Trash className="stroke-destructive-foreground" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Delete Project</ItemTitle>
            <ItemDescription>
              Your project will be permanently deleted including all of its data. This action is
              irreversible.
            </ItemDescription>
          </ItemContent>
          <ItemActions>{children}</ItemActions>
        </Item>
      </CardContent>
    </Card>
  );
};

export default function ProjectDangerZone() {
  const router = useRouter();
  const { data: org, isLoading: isOrgLoading } = useOrg();
  const { data: project, isLoading: isProjectLoading } = useProject();
  const permissions = usePermissions({
    deleteProject: { project: ["delete"] },
  });
  const { deleteProject } = useProjectMutations();

  const handleProjectDeletion = async () => {
    const id = toast.loading("Deleting project...");
    deleteProject
      .mutateAsync({ orgId: org!.id, projectId: project!.id })
      .then(() => {
        toast.success("Successfully deleted project", { id });
        router.replace(`/dashboard/${org?.slug}`);
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast.error(error.message, { id });
        } else {
          toast.error("An unexpected error happened while deleting project", {
            id,
          });
        }
      });
  };

  if (isOrgLoading || isProjectLoading) {
    return (
      <CardComponent>
        <Skeleton className="h-9 w-30" />
      </CardComponent>
    );
  }

  return (
    <CardComponent>
      <CallbackDialog
        title="Delete Project"
        description="Are you sure you want to delete this project? This action is irreversible"
        cancelButtonText="Cancel"
        submitButtonText="Delete"
        submitButtonVariant={"destructive"}
        cancelButtonVariant={"outline"}
        callback={handleProjectDeletion}
        confirmationText={project?.name}
        trigger={
          <Button variant={"destructive"} disabled={!permissions?.deleteProject}>
            Delete Project
          </Button>
        }
      />
    </CardComponent>
  );
}
