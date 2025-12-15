"use client";
import FormDialog from "@/src/components/FormDialog";
import { queryClient } from "@/src/components/QueryClientWrapper";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
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
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import {
  DeleteDatabase,
  RenameDatabase,
} from "@/src/controllers/ExternalDatabaseController";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export type Database = {
  id: string;
  name: string;
  endpoint: string;
  region: string;
  type: string;
};

const DatabaseDeletionDialog = ({
  id,
  trigger,
}: {
  id: string;
  trigger: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Database</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this database? All deployments
            associated with this database will be removed. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:flex-col gap-4">
          <Button
            className="w-full"
            variant={"destructive"}
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              await handleDatabaseDeletion(id);
              setIsLoading(false);
            }}
          >
            Delete
          </Button>
          <DialogClose className="w-full" asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const handleDatabaseDeletion = async (id: string) => {
  const toastId = toast.loading("Deleting database...");
  try {
    await DeleteDatabase(id);
    queryClient.setQueryData("databases", (oldData) => {
      if (!oldData) return oldData;
      return (oldData as Database[]).filter((db) => db.id !== id);
    });
    toast.success("Database deleted successfully", { id: toastId });
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message, { id: toastId });
    } else {
      toast.error("An unexpected error occurred", { id: toastId });
    }
  }
};

const handleDatabaseRename = async (id: string, name: string) => {
  const toastId = toast.loading("Renaming database...");
  try {
    await RenameDatabase(id, name);
    queryClient.setQueryData("databases", (oldData) => {
      if (!oldData) return oldData;
      return (oldData as Database[]).map((db) =>
        db.id === id ? { ...db, name } : db,
      );
    });
    toast.success("Database renamed successfully", { id: toastId });
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message, { id: toastId });
    } else {
      toast.error("An unexpected error occurred", { id: toastId });
    }
  }
};

const DatabaseRenameDialog = ({
  id,
  trigger,
}: {
  id: string;
  trigger: React.ReactNode;
}) => {
  const [open, onOpenChange] = useState(false);
  const formSchema = z.object({
    name: z.string().min(1).max(64),
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
      callback={async (data) => {
        await handleDatabaseRename(id, data.name);
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
            <FormControl>Name</FormControl>
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

export const columns: ColumnDef<Database>[] = [
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
                id={db.id}
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                  >
                    Rename Database
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuSeparator />
              <DatabaseDeletionDialog
                id={db.id}
                trigger={
                  <DropdownMenuItem
                    variant="destructive"
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
