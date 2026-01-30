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
import { useTeam, useTeamMutations } from "@/src/hooks/useTeam";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const CardComponent = ({ children }: React.PropsWithChildren) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Team Name</CardTitle>
      <CardDescription>
        This is the name used to generate the URL of your team.
      </CardDescription>
    </CardHeader>
    <Separator />
    <CardContent>{children}</CardContent>
  </Card>
);

export default function TeamName() {
  const { data: team, isLoading, refetch } = useTeam();
  const [open, setIsOpen] = useState(false);
  const { renameTeam } = useTeamMutations();

  const formSchema = z
    .object({
      name: z
        .string()
        .min(3, { error: "Name must be at least 3 characters" })
        .max(32, { error: "Name must be at most 32 characters" }),
    })
    .refine((values) => values.name !== team?.name, {
      error:
        "Given display name must be different than your current display name",
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleChangeName = (name: string) => {
    const id = toast.loading("Updating team name...");
    renameTeam
      .mutateAsync({ teamId: team!.id, payload: { name } })
      .then(async () => {
        toast.success("Successfully updated team name!", {
          id,
        });
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast.error(error.message, { id });
        } else {
          toast.error("An unexpected error happened while updating team name", {
            id,
          });
        }
      });
  };

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
                  <Input placeholder={team?.name} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <CallbackDialog
            title="Rename Team"
            description="Changing your team name will invalidate your current team URL. Are you sure you want to proceed?"
            open={open}
            onOpenChange={setIsOpen}
            callback={() => {
              form.handleSubmit(({ name }) => {
                handleChangeName(name);
              })();
            }}
          />
          <Button>Save</Button>
        </form>
      </Form>
    </CardComponent>
  );
}
