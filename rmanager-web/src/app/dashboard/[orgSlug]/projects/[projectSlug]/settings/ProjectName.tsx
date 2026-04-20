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
import { useOrg, usePermissions } from "@/src/hooks/useOrg";
import { useProject, useProjectMutations } from "@/src/hooks/useProject";
import { RenameProjectSchema } from "@rmanager/shared/lib/types/project-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BetterAuthError } from "@rmanager/shared/lib/utils";

const CardComponent = ({ children }: React.PropsWithChildren) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Project Name</CardTitle>
      <CardDescription>
        This is the name of your project displayed across the dashboard.
      </CardDescription>
    </CardHeader>
    <Separator />
    <CardContent>{children}</CardContent>
  </Card>
);

export default function ProjectName() {
  const router = useRouter();
  const { data: org, isLoading: isOrgLoading } = useOrg();
  const { data: project, isLoading: isProjectLoading } = useProject();
  const permissions = usePermissions({
    canRename: { project: ["rename"] },
  });
  const [open, setIsOpen] = useState(false);
  const { renameProject } = useProjectMutations();

  const formSchema = RenameProjectSchema.refine(
    (values) => values.name !== project?.name,
    {
      error:
        "New project name must be different than your current project name",
    },
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleChangeName = (name: string) => {
    const id = toast.loading("Updating project name...");
    renameProject
      .mutateAsync({ orgId: org!.id, projectId: project!.id, newName: name })
      .then(async (newProject) => {
        toast.success("Successfully updated project name!", {
          id,
        });
        router.replace(
          `/dashboard/${org?.slug}/projects/${newProject?.slug}/settings`,
        );
      })
      .catch((error) => {
        if (error instanceof BetterAuthError) {
          toast.error(error.message, { id });
        } else {
          toast.error(
            "An unexpected error happened while updating project name",
            {
              id,
            },
          );
        }
      });
  };

  if (isOrgLoading || isProjectLoading) {
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
            name="name"
            render={({ field }) => (
              <FormItem className="w-full max-w-lg">
                <FormControl>
                  <Input
                    placeholder={project?.name}
                    disabled={!permissions?.canRename}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <CallbackDialog
            title="Rename Project"
            description="Changing your project name will invalidate your current project URL. Are you sure you want to proceed?"
            open={open}
            onOpenChange={setIsOpen}
            callback={() => {
              form.handleSubmit(({ name }) => {
                handleChangeName(name);
              })();
            }}
          />
          <Button disabled={!permissions?.canRename}>Save</Button>
        </form>
      </Form>
    </CardComponent>
  );
}
