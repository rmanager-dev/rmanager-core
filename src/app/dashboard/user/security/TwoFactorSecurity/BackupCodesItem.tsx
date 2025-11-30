import { PasswordConfirmationDialog } from "@/src/components/PasswordConfirmationDialog";
import ViewBackupCodeDialog from "@/src/components/TwoFactor/ViewBackupCodeDialog";
import { Button } from "@/src/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/components/ui/item";
import { Skeleton } from "@/src/components/ui/skeleton";
import { authClient } from "@/src/lib/auth-client";
import { RotateCcwKey } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const ItemComponent = ({ children }: React.PropsWithChildren) => {
  return (
    <Item variant={"outline"} className="w-full">
      <ItemMedia variant={"icon"}>
        <RotateCcwKey />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Backup Codes</ItemTitle>
        <ItemDescription>
          Security codes that you can use in case you lost access to your 2FA
          Authenticator App
        </ItemDescription>
      </ItemContent>
      <ItemActions>{children}</ItemActions>
    </Item>
  );
};

export default function BackupCodesItemSecurity() {
  const { data, isPending } = authClient.useSession();
  const [backupCodes, setBackupCodes] = useState<string[]>();
  const user = data?.user;

  const handleRegenerateBackupCodes = async (password: string) => {
    const toasterId = toast.loading("Regenerating backup codes...");
    const { data, error } = await authClient.twoFactor.generateBackupCodes({
      password,
    });

    if (error) {
      toast.error(
        error.message ?? "There was an error while regenerating backup codes.",
        { id: toasterId },
      );
      return;
    }

    toast.dismiss(toasterId);
    setBackupCodes(data.backupCodes);
  };

  if (!user || isPending) {
    return (
      <ItemComponent>
        <Skeleton className="h-8 w-16" />
      </ItemComponent>
    );
  }

  return (
    <ItemComponent>
      {backupCodes && (
        <ViewBackupCodeDialog
          backupCodes={backupCodes}
          open={backupCodes !== undefined}
          onOpenChange={(newVal) => {
            if (!newVal) {
              setBackupCodes(undefined);
            }
          }}
        >
          <Button variant={"outline"}>View</Button>
        </ViewBackupCodeDialog>
      )}
      {!backupCodes && (
        <PasswordConfirmationDialog
          title="Regenerate backup codes"
          description="Enter your password below to regenerate your 2FA backup codes. This action will invalidate any previous backup codes."
          submitButtonText="Regenerate"
          callback={handleRegenerateBackupCodes}
        >
          <Button variant={"outline"} disabled={!user.twoFactorEnabled}>
            Regenerate
          </Button>
        </PasswordConfirmationDialog>
      )}
    </ItemComponent>
  );
}
