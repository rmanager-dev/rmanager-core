import { useState } from "react";
import TotpTwoFactorDialog from "./TotpTwoFactorDialog";
import TwoFactorSwitcherDialog from "./TwoFactorSwitcherDialog";
import BackupCodeTwoFactorDialog from "./BackupCodeTwoFactorDialog";

interface TwoFactorTotpDialog {
  open: boolean;
  onOpenChanged: (open: boolean) => void;
}

export default function TwoFactorDialog({
  open,
  onOpenChanged,
}: TwoFactorTotpDialog) {
  const [currentDialog, setCurrentDialog] = useState<
    "switch" | "totp" | "backup"
  >("switch");

  const renderDialog = () => {
    switch (currentDialog) {
      case "switch":
        return (
          <TwoFactorSwitcherDialog
            open={open}
            onOpenChanged={onOpenChanged}
            setCurrentDialog={setCurrentDialog}
          />
        );
      case "totp":
        return (
          <TotpTwoFactorDialog
            open={open}
            onOpenChanged={(open) => {
              if (!open) {
                setCurrentDialog("switch");
              }
            }}
          />
        );
      case "backup":
        return (
          <BackupCodeTwoFactorDialog
            open={open}
            onOpenChanged={(open) => {
              if (!open) {
                setCurrentDialog("switch");
              }
            }}
          />
        );
    }
  };

  return renderDialog();
}
