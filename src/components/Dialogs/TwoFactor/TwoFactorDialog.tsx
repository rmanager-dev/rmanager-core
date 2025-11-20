import { useState } from "react";
import TotpTwoFactorDialog from "./TotpTwoFactorDialog";

interface TwoFactorTotpDialog {
  open: boolean;
  onOpenChanged: (open: boolean) => void;
}

export default function TwoFactorDialog({
  open,
  onOpenChanged,
}: TwoFactorTotpDialog) {
  const [currentDialog, setCurrentDialog] = useState<"switch" | "totp">("totp");

  const renderDialog = () => {
    switch (currentDialog) {
      case "totp":
        return (
          <TotpTwoFactorDialog open={open} onOpenChanged={onOpenChanged} />
        );
    }
  };

  return renderDialog();
}
