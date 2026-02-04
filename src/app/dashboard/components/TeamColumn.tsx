"use client";
import CallbackDialog from "@/src/components/CallbackDialog";
import LocalTime from "@/src/components/LocalTime";
import { queryClient } from "@/src/components/QueryClientWrapper";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Skeleton } from "@/src/components/ui/skeleton";
import { TeamController } from "@/src/controllers/TeamController";
import { authClient } from "@/src/lib/auth-client";
import { Team } from "@/src/lib/types/team-types";
import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

export const teamColumns: ColumnDef<Team>[] = [
  {
    id: "team_details",
    header: "Team",
    accessorFn: (row) => `${row.displayName} ${row.name}`,
    cell: (info) => (
      <div className="flex flex-col w-full">
        <span className="font-semibold text-sm text-foreground truncate">
          {info.row.original.displayName}
        </span>
        <span className="text-[11px] text-muted-foreground italic">
          @{info.row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => {
      return <span className="capitalize">{getValue<string>()}</span>;
    },
  },
  {
    accessorKey: "joinedAt",
    header: "Joined",
    cell: ({ getValue }) => {
      const date = new Date(getValue<string>());
      return <LocalTime time={date} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { data, isPending } = authClient.useSession();
      const { mutateAsync: leaveTeam } = useMutation({
        mutationFn: ({
          teamId,
          memberId,
        }: {
          teamId: string;
          memberId: string;
        }) => TeamController.removeMember(teamId, memberId),
        onSuccess: (_, { teamId }) => {
          queryClient.setQueryData<Team[]>(["teams"], (prevData) =>
            prevData ? prevData.filter((team) => team.id !== teamId) : [],
          );
        },
      });

      const team = row.original;

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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(team.id)}
              >
                Copy Team ID
              </DropdownMenuItem>
              <CallbackDialog
                title="Leave Team"
                description={`Are you sure you want to leave the team "${team.displayName}" ?`}
                callback={async () => {
                  const toastId = toast.loading("Leaving team...");
                  try {
                    await leaveTeam({
                      memberId: data.user.id,
                      teamId: team.id,
                    });
                    toast.success("Successully left the team!", {
                      id: toastId,
                    });
                  } catch (error) {
                    if (error instanceof Error) {
                      toast.error(error.message, { id: toastId });
                    } else {
                      toast.error(
                        "An unknown error happened while leaving the team. Please try again later.",
                        { id: toastId },
                      );
                    }
                  }
                }}
                cancelButtonText="Cancel"
                submitButtonText="Leave"
                submitButtonVariant={"destructive"}
                cancelButtonVariant={"outline"}
                trigger={
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    Leave Team
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
