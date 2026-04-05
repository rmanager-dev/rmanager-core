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
import { useProject, useProjectMutations } from "@/src/hooks/useProject";
import { useTeam } from "@/src/hooks/useTeam";
import { hasPermission } from "@/src/lib/utils/team-utils";
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
            <ItemTitle>Delete Team</ItemTitle>
            <ItemDescription>
              Your team will be permanently deleted including all of its projects. This action is
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
  const { data: team, isLoading: isTeamLoading } = useTeam();
  const { data: project, isLoading: isProjectLoading } = useProject();

  const { deleteProject } = useProjectMutations();

  const handleProjectDeletion = async () => {
    const id = toast.loading("Deleting project...");
    deleteProject
      .mutateAsync({ teamId: team!.id, projectId: project!.id })
      .then(() => {
        toast.success("Successfully deleted project", { id });
        router.replace(`/dashboard/${team?.slug}`);
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

  if (isTeamLoading || isProjectLoading) {
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
          <Button variant={"destructive"} disabled={!hasPermission(team?.role, "DeleteProject")}>
            Delete Project
          </Button>
        }
      />
    </CardComponent>
  );
}
