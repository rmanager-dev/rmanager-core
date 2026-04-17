"use client";
import CallbackDialog from "@/src/components/CallbackDialog";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useOrg, useOrgMutations, usePermissions } from "@/src/hooks/useOrg";
import { BetterAuthError } from "@/src/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const CardComponent = ({ children }: React.PropsWithChildren) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Organization Name</CardTitle>
      <CardDescription>
        This is the organization's name displayed accross the dashboard
      </CardDescription>
    </CardHeader>
    <Separator />
    <CardContent>{children}</CardContent>
  </Card>
);

export default function OrganizationName() {
  const { data: org, isLoading } = useOrg();
  const [open, setIsOpen] = useState(false);
  const { updateOrg } = useOrgMutations();
  const permissions = usePermissions({ canUpdateOrg: { organization: ["update"] } });

  const formSchema = z
    .object({
      name: z
        .string()
        .min(3, { error: "Name must be at least 3 characters" })
        .max(32, { error: "Name must be at most 32 characters" }),
    })
    .refine((values) => values.name !== org?.name, {
      error: "Given organization name must be different than your current organization name",
      path: ["name"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleChangeName = (name: string) => {
    const id = toast.loading("Updating organization name...");
    updateOrg
      .mutateAsync({ organizationId: org!.id, data: { name } })
      .then(() => {
        toast.success("Successfully updated organization name!", {
          id,
        });
        form.reset();
      })
      .catch((error) => {
        console.log(error);
        if (error instanceof BetterAuthError) {
          toast.error(error.message, { id });
        } else {
          toast.error("An unexpected error happened while updating organization name", {
            id,
          });
        }
      });
  };

  if (isLoading) {
    return (
      <CardComponent>
        <div className="flex justify-between gap-2">
          <Skeleton className="h-9 w-full max-w-lg" />
          <Skeleton className="h-9 w-16" />
        </div>
      </CardComponent>
    );
  }

  return (
    <CardComponent>
      <Form {...form}>
        <form
          className="flex justify-between gap-2"
          onSubmit={form.handleSubmit(({ name }) => handleChangeName(name))}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full max-w-lg">
                <FormControl>
                  <Input placeholder={org?.name} disabled={!permissions?.canUpdateOrg} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={!permissions?.canUpdateOrg}>Save</Button>
        </form>
      </Form>
    </CardComponent>
  );
}
