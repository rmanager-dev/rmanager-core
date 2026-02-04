import CallbackDialog from "@/src/components/CallbackDialog";
import LocalTime from "@/src/components/LocalTime";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useRobloxCredentialMutations } from "@/src/hooks/useRobloxCredential";
import { useTeam } from "@/src/hooks/useTeam";
import { RobloxCredential } from "@/src/lib/types/roblox-credentials-types";
import { hasPermission } from "@/src/lib/utils/team-utils";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

export const robloxCredentialColumn: ColumnDef<RobloxCredential>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ getValue }) => {
      const time = new Date(getValue<string>());
      return <LocalTime time={time} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const cred = row.original;
      const { data: team, isLoading } = useTeam();
      const { deleteRobloxCredential } = useRobloxCredentialMutations();

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
                onClick={() => navigator.clipboard.writeText(cred.id)}
              >
                Copy Roblox Credential ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <CallbackDialog
                title="Delete Roblox Credential"
                description="Are you sure you wanna unlink this roblox credential from your team?"
                callback={async () => {
                  const id = toast.loading("Deleting roblox credential...");
                  try {
                    await deleteRobloxCredential.mutateAsync({
                      teamId: team.id,
                      credId: cred.id,
                    });
                    toast.success("Successfully deleted roblox credential!", {
                      id,
                    });
                  } catch (error) {
                    if (error instanceof Error) {
                      toast.error(error.message, { id });
                    } else {
                      toast.error(
                        "An unknown error occured while deleting your roblox credential. Please try again later.",
                        { id },
                      );
                    }
                  }
                }}
                confirmationText={cred.name}
                trigger={
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={
                      !hasPermission(team.role, "DeleteRobloxCredential")
                    }
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                  >
                    Delete Roblox Credential
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
