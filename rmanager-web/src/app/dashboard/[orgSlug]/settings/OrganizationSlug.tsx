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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useOrg, useOrgMutations, usePermissions } from "@/src/hooks/useOrg";
import { BetterAuthError } from "@rmanager/shared/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const CardComponent = ({ children }: React.PropsWithChildren) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Organization Slug</CardTitle>
      <CardDescription>
        This is the slug used to generate the URL of your organization.
      </CardDescription>
    </CardHeader>
    <Separator />
    <CardContent>{children}</CardContent>
  </Card>
);

export default function OrganizationSlug() {
  const router = useRouter();
  const { data: org, isLoading } = useOrg();
  const [open, setIsOpen] = useState(false);
  const { updateOrg } = useOrgMutations();
  const permissions = usePermissions({
    canUpdateOrg: { organization: ["update"] },
  });

  const formSchema = z
    .object({
      slug: z
        .string()
        .min(3, { error: "Slug must be at least 3 characters" })
        .max(32, { error: "Slug must be at most 32 characters" }),
    })
    .refine((values) => values.slug !== org?.slug, {
      error: "Given slug must be different than your current organization slug",
      path: ["slug"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
    },
  });

  const handleChangeSlug = (slug: string) => {
    const id = toast.loading("Updating organization slug...");
    updateOrg
      .mutateAsync({ organizationId: org!.id, data: { slug } })
      .then((o) => {
        toast.success("Successfully updated organization slug!", {
          id,
        });
        router.push(`/dashboard/${o.slug}/settings`);
      })
      .catch((error) => {
        if (
          error instanceof BetterAuthError &&
          error.code == "ORGANIZATION_SLUG_ALREADY_TAKEN"
        ) {
          toast.dismiss(id);
          form.setError("slug", { message: "Slug is already taken" });
          form.setFocus("slug");
        } else if (error instanceof BetterAuthError) {
          console.log(error.code);
          toast.error(error.message, { id });
        } else {
          toast.error(
            "An unexpected error happened while updating organization slug",
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
          onSubmit={form.handleSubmit(() => setIsOpen(true))}
        >
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full max-w-lg">
                <FormControl>
                  <Input
                    placeholder={org?.slug}
                    disabled={!permissions?.canUpdateOrg}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <CallbackDialog
            title="Chang Organization's Slug"
            description="Changing your organization slug will invalidate your current organization URL. Are you sure you want to proceed?"
            open={open}
            onOpenChange={setIsOpen}
            callback={() => {
              form.handleSubmit(({ slug }) => {
                handleChangeSlug(slug);
              })();
            }}
          />
          <Button disabled={!permissions?.canUpdateOrg}>Save</Button>
        </form>
      </Form>
    </CardComponent>
  );
}
