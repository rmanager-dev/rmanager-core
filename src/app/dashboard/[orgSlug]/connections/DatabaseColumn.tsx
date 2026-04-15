import CallbackDialog from "@/src/components/CallbackDialog";
import FormDialog from "@/src/components/FormDialog";
import LocalTime from "@/src/components/LocalTime";
import StatusBadge from "@/src/components/StatusBadge";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useDatabaseMutations } from "@/src/hooks/useDatabase";
import { useOrg, usePermissions } from "@/src/hooks/useOrg";
import { Database, DatabaseRenameSchema, DatabaseRotateSchema } from "@/src/lib/types/database-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Copy, RefreshCw, RotateCcwKey, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const DatabaseRenameDialog = ({
  databaseId,
  orgId,
  trigger,
}: {
  databaseId: string;
  orgId: string;
  trigger: React.ReactNode;
}) => {
  const [open, onOpenChange] = useState(false);
  const { renameDatabase } = useDatabaseMutations();
  const form = useForm({
    resolver: zodResolver(DatabaseRenameSchema),
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
            orgId,
            databaseId,
            newName: name,
          });
          toast.success("Successfully renamed database!", { id });
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
              <Input placeholder="New Database Name" maxLength={64} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
};

const RotateDatabaseDialog = ({
  databaseId,
  orgId,
  trigger,
}: {
  databaseId: string;
  orgId: string;
  trigger: React.ReactNode;
}) => {
  const [open, onOpenChange] = useState(false);
  const { rotateDatabase } = useDatabaseMutations();
  const form = useForm({
    resolver: zodResolver(DatabaseRotateSchema),
    defaultValues: {
      accessKey: "",
      secretKey: "",
    },
  });

  return (
    <FormDialog
      title="Rotate Database Credentials"
      description="Enter new access and secret keys. The connection will be verified before saving."
      form={form}
      callback={async ({ accessKey, secretKey }) => {
        const id = toast.loading("Rotating database credentials...");
        try {
          await rotateDatabase.mutateAsync({ orgId, databaseId, accessKey, secretKey });
          toast.success("Successfully rotated database credentials!", { id });
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message, { id });
          } else {
            toast.error(
              "An unknown error occured while rotating your database credentials. Please try again later.",
              { id },
            );
          }
        }
        onOpenChange(false);
      }}
      trigger={trigger}
      submitButtonText="Rotate"
      open={open}
      onOpenChange={onOpenChange}
    >
      <FormField
        control={form.control}
        name="accessKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Access Key ID</FormLabel>
            <FormControl>
              <Input placeholder="New Access Key ID" maxLength={256} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="secretKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Secret Access Key</FormLabel>
            <FormControl>
              <Input placeholder="New Secret Access Key" maxLength={256} {...field} />
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cred = row.original;
      const { data: org, isLoading } = useOrg();

      if (!org || isLoading) {
        return (
          <div className="flex justify-end">
            <Skeleton className="size-8" />
          </div>
        );
      }

      return (
        <StatusBadge
          kind={cred.status}
          errorMessage={cred.errorMessage ?? undefined}
          lastRefreshed={new Date(cred.lastRefreshedAt)}
        />
      );
    },
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
    accessorKey: "lastUsed",
    header: "Last Used",
    cell: ({ getValue }) => {
      const time = new Date(getValue<string>());
      return <LocalTime time={time} />;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => {
      const time = new Date(getValue<string>());
      return <LocalTime time={time} mode="absolute" />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const db = row.original;
      const { data: org, isLoading } = useOrg();
      const { deleteDatabase, refreshDatabase } = useDatabaseMutations();
      const permissions = usePermissions({
        canRefresh: { database: ["refresh"] },
        canRename: { database: ["rename"] },
        canRotate: { database: ["rotate"] },
        canDelete: { database: ["delete"] },
      });

      if (!org || isLoading) {
        return (
          <div className="flex justify-end">
            <Skeleton className="size-8" />
          </div>
        );
      }

      const handleRefresh = () => {
        const id = toast.loading("Refreshing database status...");
        refreshDatabase
          .mutateAsync({ orgId: org.id, databaseId: db.id })
          .then(() => {
            toast.success("Successfully refreshed database status!", { id });
          })
          .catch((error) => {
            if (error instanceof Error) {
              toast.error(error.message, { id });
            } else {
              toast.error(
                "An unknown error occured while refreshing your database. Please try again later.",
                { id },
              );
            }
          });
      };

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(db.id)}>
                <Copy />
                <span>Copy Database ID</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!permissions?.canRefresh} onClick={handleRefresh}>
                <RefreshCw />
                <span>Refresh Status</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DatabaseRenameDialog
                databaseId={db.id}
                orgId={org.id}
                trigger={
                  <DropdownMenuItem
                    disabled={!permissions?.canRename}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Pencil />
                    <span>Rename Database</span>
                  </DropdownMenuItem>
                }
              />
              <RotateDatabaseDialog
                databaseId={db.id}
                orgId={org.id}
                trigger={
                  <DropdownMenuItem
                    disabled={!permissions?.canRotate}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <RotateCcwKey />
                    <span>Rotate Credentials</span>
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuSeparator />
              <CallbackDialog
                title="Delete Database"
                description="Are you sure you wanna unlink this database from your organization?"
                callback={async () => {
                  const id = toast.loading("Deleting database...");
                  try {
                    await deleteDatabase.mutateAsync({
                      orgId: org.id,
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
                    disabled={!permissions?.canDelete}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash />
                    <span>Delete Database</span>
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
