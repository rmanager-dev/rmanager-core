import LocalTime from "@/src/components/LocalTime";
import type { auth } from "@/src/lib/auth";
import { authClient } from "@/src/lib/auth-client";
import { ColumnDef } from "@tanstack/react-table";

export const memberColumn: ColumnDef<typeof auth.$Infer.Member>[] = [
  {
    id: "email",
    header: "Member",
    cell: ({ cell }) => {
      const { data, isPending } = authClient.useSession();
      const { id, email } = cell.row.original.user;

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
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => {
      const role = getValue() as string;
      return <span className="capitalize">{role}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ getValue }) => {
      return <LocalTime time={new Date(getValue() as string)} />;
    },
  },
];
