"use client";
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
import { DeleteDatabase } from "@/src/controllers/ExternalDatabaseController";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
              <DropdownMenuItem>Rename Database</DropdownMenuItem>
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
