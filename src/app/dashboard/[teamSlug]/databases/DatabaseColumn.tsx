import CallbackDialog from "@/src/components/CallbackDialog";
import FormDialog from "@/src/components/FormDialog";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useDatabaseMutations } from "@/src/hooks/useDatabase";
import { useTeam } from "@/src/hooks/useTeam";
import { Database } from "@/src/lib/types/database-types";
import { hasPermission } from "@/src/lib/utils/team-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const DatabaseRenameDialog = ({
  databaseId,
  teamId,
  trigger,
}: {
  databaseId: string;
  teamId: string;
  trigger: React.ReactNode;
}) => {
  const [open, onOpenChange] = useState(false);
  const { renameDatabase } = useDatabaseMutations();
  const formSchema = z.object({
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .max(64, { message: "Name must be less than 64 characters" }),
  });
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <FormDialog
      title="Rename Database"
      description="Enter a new name for this database. This action will not affect the database's data or configuration"
      form={form}
      callback={async ({ name }) => {
        const id = toast.loading("Renaming database...");
        try {
          await renameDatabase.mutateAsync({
            teamId,
            databaseId,
            newName: name,
          });
          toast.success("Successfully renamed team!");
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message, { id });
          } else {
            toast.error(
              "An unknown error occured while renaming your database. Please try again later.",
              { id },
            );
          }
        }
        onOpenChange(false);
      }}
      trigger={trigger}
      submitButtonText="Rename"
      open={open}
      onOpenChange={onOpenChange}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input
                placeholder="New Database Name"
                maxLength={64}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
};

export const databaseColumn: ColumnDef<Database>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "endpoint",
    header: "Endpoint URI",
    cell: ({ row }) => {
      const fullUri = row.getValue("endpoint") as string;
      const match = fullUri.match(/([^.]+\.[^.]+)$/); // Get domain.tld at the end of the endpoint
      return (
        <div className="flex items-center space-x-2">
          <span>{match ? match[1] : fullUri}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const db = row.original;
      const { data: team, isLoading } = useTeam();
      const { deleteDatabase } = useDatabaseMutations();

      if (!team || isLoading) {
        return (
          <div className="flex justify-end">
            <Skeleton className="size-8" />
          </div>
        );
      }

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="align-end">
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(db.id)}
              >
                Copy Database ID
              </DropdownMenuItem>
              <DatabaseRenameDialog
                databaseId={db.id}
                teamId={team.id}
                trigger={
                  <DropdownMenuItem
                    disabled={!hasPermission(team.role, "RenameDatabase")}
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                  >
                    Rename Database
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuSeparator />
              <CallbackDialog
                title="Delete Database"
                description="Are you sure you wanna unlink this database from your team?"
                callback={async () => {
                  const id = toast.loading("Deleting database...");
                  try {
                    await deleteDatabase.mutateAsync({
                      teamId: team.id,
                      databaseId: db.id,
                    });
                    toast.success("Successfully deleted database!", { id });
                  } catch (error) {
                    if (error instanceof Error) {
                      toast.error(error.message, { id });
                    } else {
                      toast.error(
                        "An unknown error occured while deleting your database. Please try again later.",
                        { id },
                      );
                    }
                  }
                }}
                confirmationText={db.name}
                trigger={
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={!hasPermission(team.role, "DeleteDatabase")}
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                  >
                    Delete Database
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
