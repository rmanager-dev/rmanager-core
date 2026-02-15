import CallbackDialog from "@/src/components/CallbackDialog";
import FormDialog from "@/src/components/FormDialog";
import LocalTime from "@/src/components/LocalTime";
import StatusBadge from "@/src/components/StatusBadge";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useRobloxCredentialMutations } from "@/src/hooks/useRobloxCredential";
import { useTeam } from "@/src/hooks/useTeam";
import {
  RobloxCredential,
  RobloxCredentialRenameSchema,
  RobloxCredentialRotateSchema,
} from "@/src/lib/types/roblox-credentials-types";
import { hasPermission } from "@/src/lib/utils/team-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Copy, MoreHorizontal, Pencil, RefreshCw, RotateCcwKey, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const RenameRobloxCredentialDialog = ({
  credId,
  children,
}: { credId: string } & React.PropsWithChildren) => {
  const { data: team } = useTeam();
  const { renameRobloxCredential } = useRobloxCredentialMutations();
  const form = useForm({
    resolver: zodResolver(RobloxCredentialRenameSchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <FormDialog
      title="Rename Roblox Credential"
      description="Enter a new name for your Roblox credential. This action will not impact your projects."
      form={form}
      callback={({ name }) => {
        const id = toast.loading("Renaming Roblox credential...");
        renameRobloxCredential
          .mutateAsync({ teamId: team!.id, credId, newName: name })
          .then(() => {
            toast.success("Successfully renamed Roblox credential!", { id });
          })
          .catch((error) => {
            if (error instanceof Error) {
              toast.error(error.message, { id });
            } else {
              toast.error(
                "An unknown error happened while renaming Roblox credential. Please try again later.",
                { id },
              );
            }
          });
      }}
      submitButtonText="Rename"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="New Name" maxLength={32} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
};

const RotateRobloxCredentialDialog = ({
  credId,
  children,
}: { credId: string } & React.PropsWithChildren) => {
  const { data: team } = useTeam();
  const { rotateRobloxCredential } = useRobloxCredentialMutations();
  const form = useForm({
    resolver: zodResolver(RobloxCredentialRotateSchema),
    defaultValues: {
      key: "",
    },
  });

  return (
    <FormDialog
      title="Rotate Roblox Credential"
      description="Enter a new API key for your Roblox credential."
      form={form}
      callback={({ key }) => {
        const id = toast.loading("Rotating Roblox credential...");
        rotateRobloxCredential
          .mutateAsync({ teamId: team!.id, credId, newKey: key })
          .then(() => {
            toast.success("Successfully rotated Roblox credential!", { id });
          })
          .catch((error) => {
            if (error instanceof Error) {
              toast.error(error.message, { id });
            } else {
              toast.error(
                "An unknown error happened while rotating Roblox credential. Please try again later.",
                { id },
              );
            }
          });
      }}
      submitButtonText="Rotate"
      trigger={children}
    >
      <FormField
        control={form.control}
        name="key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Key</FormLabel>
            <FormControl>
              <Input placeholder="Secret API Key" maxLength={2048} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
};

export const robloxCredentialColumn: ColumnDef<RobloxCredential>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cred = row.original;
      const { data: team, isLoading } = useTeam();

      if (!team || isLoading) {
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
    accessorKey: "expirationDate",
    header: "Expires",
    cell: ({ getValue }) => {
      const time = getValue<string | undefined>();
      if (!!time) {
        return <LocalTime time={new Date(time)} />;
      } else {
        return "Never";
      }
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => {
      const time = new Date(getValue<string>());
      return <LocalTime time={time} />;
    },
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
    id: "actions",
    cell: ({ row }) => {
      const cred = row.original;
      const { data: team, isLoading } = useTeam();
      const { deleteRobloxCredential, refreshRobloxCredential } = useRobloxCredentialMutations();

      if (!team || isLoading) {
        return (
          <div className="flex justify-end">
            <Skeleton className="size-8" />
          </div>
        );
      }

      const handleKeyRefresh = () => {
        const id = toast.loading("Refreshing Roblox credential info...");
        refreshRobloxCredential
          .mutateAsync({ teamId: team.id, credId: cred.id })
          .then(() => {
            toast.success("Successfully refreshed Roblox credential info!", { id });
          })
          .catch((error) => {
            if (error instanceof Error) {
              toast.error(error.message, { id });
            } else {
              toast.error(
                "An unknown error happened while refreshing Roblox credential. Please try again later.",
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(cred.id)}>
                <Copy />
                <span>Copy Key ID</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!hasPermission(team.role, "RefreshRobloxCredential")}
                onClick={() => handleKeyRefresh()}
              >
                <RefreshCw />
                <span>Refresh Key</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <RenameRobloxCredentialDialog credId={cred.id}>
                <DropdownMenuItem
                  disabled={!hasPermission(team.role, "RenameRobloxCredential")}
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <Pencil />
                  <span>Rename Key</span>
                </DropdownMenuItem>
              </RenameRobloxCredentialDialog>
              <RotateRobloxCredentialDialog credId={cred.id}>
                <DropdownMenuItem
                  disabled={!hasPermission(team.role, "RotateRobloxCredential")}
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <RotateCcwKey />
                  <span>Rotate Key</span>
                </DropdownMenuItem>
              </RotateRobloxCredentialDialog>
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
                    disabled={!hasPermission(team.role, "DeleteRobloxCredential")}
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <Trash />
                    <span>Delete Key</span>
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
