import LocalTime from "@/src/components/LocalTime";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Skeleton } from "@/src/components/ui/skeleton";
import { authClient } from "@/src/lib/auth-client";
import { TeamMember } from "@/src/lib/types/team-types";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export const memberColumn: ColumnDef<TeamMember>[] = [
  {
    accessorKey: "email",
    header: "Member",
    cell: ({ cell }) => {
      const { data, isPending } = authClient.useSession();
      const { id, email } = cell.row.original;

      if (!data || isPending || id !== data.user.id) {
        return <span>{email}</span>;
      }

      return (
        <div className="flex items-center gap-2">
          <span className="text">{email}</span>
          <span className="border rounded-md px-2 py-0.5 text-xs">You</span>
        </div>
      );
    },
  },
  {
    accessorKey: "twoFactorEnabled",
    header: "2FA Enabled",
    cell: ({ getValue }) => {
      const isEnabled = getValue() as boolean;
      return isEnabled ? "Yes" : "No";
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => {
      const role = getValue() as string;
      return <span className="capitalize">{role}</span>;
    },
  },
  {
    accessorKey: "joinedAt",
    header: "Joined",
    cell: ({ getValue }) => {
      return <LocalTime time={new Date(getValue() as string)} />;
    },
  },
];
