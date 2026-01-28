import FormDialog from "@/src/components/FormDialog";
import { queryClient } from "@/src/components/QueryClientWrapper";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { CreateTeam } from "@/src/controllers/TeamController";
import { useTeamMutations } from "@/src/hooks/useTeam";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface CreateTeamDialogProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CreateTeamDialog({
  open,
  setIsOpen,
}: CreateTeamDialogProps) {
  const { createTeam } = useTeamMutations();

  const handleTeamCreation = async (name: string) => {
    const toastId = toast.loading("Creating team...");
    createTeam
      .mutateAsync(name)
      .then(() => {
        toast.success("Successfully created your team!", { id: toastId });
        setIsOpen(false);
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast.error(error.message, { id: toastId });
        } else {
          toast.error(
            "An unknown error occured while creating your team. Please try again later.",
            { id: toastId },
          );
        }
      });
  };

  const CreateTeamSchema = z.object({
    name: z
      .string()
      .min(3, { error: "Team name must be at least 3 characters" })
      .max(32, { error: "Team name must be at most 32 characters" }),
  });
  const form = useForm({
    resolver: zodResolver(CreateTeamSchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <FormDialog
      title="Create a new Team"
      description="A team enables users to group their project and invite other people to collaborate on them."
      open={open}
      onOpenChange={setIsOpen}
      form={form}
      callback={({ name }) => {
        handleTeamCreation(name);
      }}
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
    </FormDialog>
  );
}
