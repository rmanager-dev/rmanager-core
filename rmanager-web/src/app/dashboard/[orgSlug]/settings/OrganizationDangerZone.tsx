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
import { useOrg, useOrgMutations, usePermissions } from "@/src/hooks/useOrg";
import { BetterAuthError } from "@rmanager/shared/lib/utils";
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
        <Item
          variant={"outline"}
          className="border-destructive bg-destructive/5"
        >
          <ItemMedia variant={"icon"} className="border-none bg-destructive">
            <Trash className="stroke-destructive-foreground" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Delete Organization</ItemTitle>
            <ItemDescription>
              Your organization will be permanently deleted including all of its
              projects. This action is irreversible.
            </ItemDescription>
          </ItemContent>
          <ItemActions>{children}</ItemActions>
        </Item>
      </CardContent>
    </Card>
  );
};

export default function OrganizationDangerZone() {
  const router = useRouter();
  const { data: org, isLoading } = useOrg();
  const { deleteOrg } = useOrgMutations();
  const permissions = usePermissions({
    canDeleteOrg: { organization: ["delete"] },
  });

  const handleOrganizationDeletion = async () => {
    const id = toast.loading("Deleting organization...");
    deleteOrg
      .mutateAsync({ organizationId: org!.id })
      .then(() => {
        toast.success("Successfully deleted organization", { id });
        router.replace("/dashboard");
      })
      .catch((error) => {
        if (error instanceof BetterAuthError) {
          toast.error(error.message, { id });
        } else {
          toast.error(
            "An unexpected error happened while deleting organization",
            {
              id,
            },
          );
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
        title="Delete Organization"
        description="Are you sure you want to delete this organization? This action is irreversible"
        cancelButtonText="Cancel"
        submitButtonText="Delete"
        submitButtonVariant={"destructive"}
        cancelButtonVariant={"outline"}
        callback={handleOrganizationDeletion}
        confirmationText={org?.name}
        trigger={
          <Button variant={"destructive"} disabled={!permissions?.canDeleteOrg}>
            Delete Organization
          </Button>
        }
      />
    </CardComponent>
  );
}
