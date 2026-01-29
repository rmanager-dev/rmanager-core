"use client";
import CallbackDialog from "@/src/components/CallbackDialog";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/card";
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
import { useTeam, useTeamMutations } from "@/src/hooks/useTeam";
import { hasPermission } from "@/src/lib/utils/team-utils";
import { Trash } from "lucide-react";
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
        <Item
          variant={"outline"}
          className="border-destructive bg-destructive/5"
        >
          <ItemMedia variant={"icon"} className="border-none bg-destructive">
            <Trash className="stroke-destructive-foreground" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Delete Team</ItemTitle>
            <ItemDescription>
              Your team will be permanently deleted including all of it's
              projects. This action is irreversible.
            </ItemDescription>
          </ItemContent>
          <ItemActions>{children}</ItemActions>
        </Item>
      </CardContent>
    </Card>
  );
};

export default function TeamDangerZone() {
  const { data: team, isLoading } = useTeam();
  const { deleteTeam } = useTeamMutations();

  const handleTeamDeletion = async () => {
    const id = toast.loading("Deleting team...");
    deleteTeam
      .mutateAsync(team!.id)
      .then(() => {
        toast.success("Successfully deleted team", { id });
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast.error(error.message, { id });
        } else {
          toast.error("An unexpected error happened while deleting team", {
            id,
          });
        }
      });
  };

  if (isLoading) {
    return (
      <CardComponent>
        <Skeleton className="h-9 w-30" />
      </CardComponent>
    );
  }

  return (
    <CardComponent>
      <CallbackDialog
        title="Delete Team"
        description="Are you sure you want to delete this team? This action is irreversible"
        cancelButtonText="Cancel"
        submitButtonText="Delete"
        submitButtonVariant={"destructive"}
        cancelButtonVariant={"outline"}
        callback={handleTeamDeletion}
        confirmationText={team?.name}
        trigger={
          <Button
            variant={"destructive"}
            disabled={!hasPermission(team?.role, "DeleteTeam")}
          >
            Delete Team
          </Button>
        }
      />
    </CardComponent>
  );
}
