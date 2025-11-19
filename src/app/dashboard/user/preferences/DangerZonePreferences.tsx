"use client";
import { PasswordConfirmationDialog } from "@/src/components/Dialogs/PasswordConfirmationDialog";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { authClient } from "@/src/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const CardComponent = ({ children }: { children: React.ReactNode }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>DANGER ZONE</CardTitle>
    </CardHeader>
    <Separator />
    <CardContent>{children}</CardContent>
  </Card>
);

const SkeletonComponent = () => (
  <CardComponent>
    <Item variant={"outline"} className="border-destructive bg-destructive/5">
      <ItemMedia variant={"icon"} className="border-none bg-destructive">
        <TriangleAlert className="stroke-destructive-foreground" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Delete account</ItemTitle>
        <ItemDescription>
          Your account will be instantly deleted with all of it's data. This
          action is irreversible. You will be prompted to enter your password
          before deletion.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Skeleton className={"h-8 w-40"} />
      </ItemActions>
    </Item>
  </CardComponent>
);

export default function DangerZonePreferences() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data, isPending } = authClient.useSession();

  const formSchema = z.object({
    password: z
      .string({ error: "Password must be a string of characters" })
      .min(1, { error: "Password must not be empty" }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleAccountDeletion = async (password: string) => {
    const toasterId = toast.loading("Deleting your account...");
    await authClient.deleteUser({
      password,
      callbackURL: "/home",
      fetchOptions: {
        onSuccess: () => {
          toast.success(
            "An email was sent to your current address to confirm account deletion.",
            {
              id: toasterId,
            }
          );
        },
        onError: (error) => {
          toast.error(error.error.message, { id: toasterId });
        },
      },
    });
  };

  if (isPending || !data?.user) {
    return <SkeletonComponent />;
  }

  return (
    <CardComponent>
      <Item variant={"outline"} className="border-destructive bg-destructive/5">
        <ItemMedia variant={"icon"} className="border-none bg-destructive">
          <TriangleAlert className="stroke-destructive-foreground" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Delete account</ItemTitle>
          <ItemDescription>
            Your account will be instantly deleted with all of it's data. This
            action is irreversible. A confirmation will be sent to your current
            email address to finish the process.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <PasswordConfirmationDialog
            title="Delete Account"
            description="Type your password below to permanently delete your account. An email will be sent to your current address to finish the process."
            callback={handleAccountDeletion}
            submitButtonText="Delete my account"
            submitButtonVariant={"destructive"}
            inputClassName="focus-visible:ring-destructive/40 focus-visible:border-destructive"
          >
            <Button variant={"destructive"}>Delete my account</Button>
          </PasswordConfirmationDialog>
        </ItemActions>
      </Item>
    </CardComponent>
  );
}
