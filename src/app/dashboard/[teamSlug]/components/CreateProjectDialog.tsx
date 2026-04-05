import FormDialog from "@/src/components/FormDialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { useProjectMutations } from "@/src/hooks/useProject";
import { useTeam } from "@/src/hooks/useTeam";
import { CreateProjectSchema } from "@/src/lib/types/project-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CreateProjectDialog({ open, setIsOpen }: CreateProjectDialogProps) {
  const { data: team } = useTeam();
  const { createProject } = useProjectMutations();

  const form = useForm({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: { name: "" },
  });

  const handleCreate = async (name: string) => {
    if (!team) return;
    const toastId = toast.loading("Creating project...");
    createProject
      .mutateAsync({ teamId: team.id, name })
      .then(() => {
        toast.success("Project created!", { id: toastId });
        setIsOpen(false);
        form.reset();
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast.error(error.message, { id: toastId });
        } else {
          toast.error(
            "An unknown error occurred while creating the project. Please try again later.",
            { id: toastId },
          );
        }
      });
  };

  return (
    <FormDialog
      title="Create a new Project"
      description="A project lets you manage a Roblox game and all of its environments"
      open={open}
      onOpenChange={setIsOpen}
      form={form}
      callback={({ name }) => handleCreate(name)}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="My Project" maxLength={64} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
