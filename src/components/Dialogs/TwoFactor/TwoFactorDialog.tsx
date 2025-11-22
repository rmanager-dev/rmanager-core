import { useState } from "react";
import TotpTwoFactorDialog from "./TotpTwoFactorDialog";
import TwoFactorSwitcherDialog from "./TwoFactorSwitcherDialog";

interface TwoFactorTotpDialog {
  open: boolean;
  onOpenChanged: (open: boolean) => void;
}

export default function TwoFactorDialog({
  open,
  onOpenChanged,
}: TwoFactorTotpDialog) {
  const [currentDialog, setCurrentDialog] = useState<"switch" | "totp">(
    "switch"
  );

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
    }
  };

  return renderDialog();
}
