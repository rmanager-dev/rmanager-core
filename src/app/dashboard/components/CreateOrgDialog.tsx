"use client";

import FormDialog from "@/src/components/FormDialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { useOrgMutations } from "@/src/hooks/useOrg";
import { BetterAuthError, nameToSlug } from "@/src/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const CreateOrgSchema = z.object({
  name: z.string().min(1).max(32),
  slug: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens"),
});

type CreateOrgForm = z.infer<typeof CreateOrgSchema>;

interface CreateOrgDialogProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CreateOrgDialog({ open, setIsOpen }: CreateOrgDialogProps) {
  const { createOrg } = useOrgMutations();
  const router = useRouter();

  const form = useForm<CreateOrgForm>({
    resolver: zodResolver(CreateOrgSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const name = form.watch("name");
  useEffect(() => {
    form.setValue("slug", nameToSlug(name));
  }, [name]);

  const handleOrgCreation = async ({ name, slug }: CreateOrgForm) => {
    const toastId = toast.loading("Creating organization...");
    await createOrg
      .mutateAsync({ name, slug })
      .then((newOrg) => {
        toast.success("Successfully created your organization!", { id: toastId });
        router.replace(`/dashboard/${newOrg.slug}`);
      })
      .catch((error) => {
        if (error instanceof BetterAuthError && error.code == "ORGANIZATION_ALREADY_EXISTS") {
          toast.dismiss(toastId);
          form.setError("slug", { message: "This slug is already taken" });
          form.setFocus("slug");
          throw error; // Make the error bubble up the call stack and prevent the form from closing
        } else if (error instanceof BetterAuthError) {
          toast.error(error.message, { id: toastId });
        } else {
          toast.error(
            "An unknown error occurred while creating your organization. Please try again later.",
            { id: toastId },
          );
        }
      });
  };

  return (
    <FormDialog
      title="Create a new Organization"
      description="An organization enables you to group projects and invite other people to collaborate on them."
      open={open}
      onOpenChange={setIsOpen}
      form={form}
      callback={handleOrgCreation}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Acme Corp" maxLength={32} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input placeholder="acme-corp" maxLength={32} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
