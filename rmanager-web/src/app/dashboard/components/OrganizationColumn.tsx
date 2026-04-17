"use client";
import CallbackDialog from "@/src/components/CallbackDialog";
import LocalTime from "@/src/components/LocalTime";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useOrgMutations } from "@/src/hooks/useOrg";
import { auth } from "@rmanager/shared/lib/auth";
import { authClient } from "@/src/lib/auth-client";
import { BetterAuthError } from "@/src/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Copy, LogOut, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

export const organizationColumns: ColumnDef<typeof auth.$Infer.Organization>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => {
      const date = new Date(getValue<string>());
      return <LocalTime time={date} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { data, isPending } = authClient.useSession();
      const { leaveOrg } = useOrgMutations();
      const org = row.original;

      if (isPending || !data) {
        return <Skeleton className="h-8 w-8" />;
      }

      return (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="align-end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(org.id)}>
                <Copy />
                <span>Copy Organization ID</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <CallbackDialog
                title="Leave organization"
                description={`Are you sure you want to leave the organization "${org.name}" ?`}
                callback={async () => {
                  const toastId = toast.loading("Leaving organization...");
                  leaveOrg
                    .mutateAsync({ organizationId: org.id })
                    .then(() => {
                      toast.success("Successfully left organization!", { id: toastId });
                    })
                    .catch((error) => {
                      if (error instanceof BetterAuthError) {
                        toast.error(error.message, { id: toastId });
                      } else {
                        toast.error("An unknown error happened while leaving organization", {
                          id: toastId,
                        });
                      }
                    });
                }}
                cancelButtonText="Cancel"
                submitButtonText="Leave"
                submitButtonVariant={"destructive"}
                cancelButtonVariant={"outline"}
                trigger={
                  <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                    <LogOut />
                    <span>Leave Organization</span>
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
