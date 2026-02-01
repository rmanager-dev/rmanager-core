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
import { useTeam, useTeamMutations } from "@/src/hooks/useTeam";
import { hasPermission } from "@/src/lib/utils/team-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const CardComponent = ({ children }: React.PropsWithChildren) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Team Display Name</CardTitle>
      <CardDescription>
        This is the name used for your team across the dashboard and is
        independant from your team's URL
      </CardDescription>
    </CardHeader>
    <Separator />
    <CardContent>{children}</CardContent>
  </Card>
);

export default function TeamDisplayName() {
  const { data: team, isLoading, refetch } = useTeam();
  const { renameTeam } = useTeamMutations();

  const formSchema = z
    .object({
      displayName: z
        .string()
        .min(3, { error: "Display name must be at least 3 characters" })
        .max(32, { error: "Display name must be 32 characters at maximum" }),
    })
    .refine((values) => values.displayName !== team?.displayName, {
      error:
        "Given display name must be different than your current display name",
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
    },
  });

  const handleChangeDisplayName = (displayName: string) => {
    const id = toast.loading("Updating team display name...");
    renameTeam
      .mutateAsync({ teamId: team!.id, payload: { displayName } })
      .then(async () => {
        toast.success("Successfully updated team display name!", {
          id,
        });
        await refetch();
        form.reset();
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast.error(error.message, { id });
        } else {
          toast.error(
            "An unexpected error happened while updating team display name",
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

  const disabled = !hasPermission(team?.role, "ChangeTeamName");

  return (
    <CardComponent>
      <Form {...form}>
        <form
          className="flex justify-between gap-2"
          onSubmit={form.handleSubmit(({ displayName }) =>
            handleChangeDisplayName(displayName),
          )}
        >
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem className="w-full max-w-lg">
                <FormControl>
                  <Input
                    placeholder={team?.displayName}
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={disabled}>
            Save
          </Button>
        </form>
      </Form>
    </CardComponent>
  );
}
