import { useState } from "react";
import DatabaseTypeSelectorDialog from "./DatabaseTypeSelectorDialog";
import S3DatabaseDialog from "./S3DatabaseDialog";

interface LinkDatabaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LinkDatabaseDialog({
  open,
  onOpenChange,
}: LinkDatabaseDialogProps) {
  const [selectedDatabaseType, setSelectedDatabaseType] = useState<
    string | null
  >(null);

  const renderDialog = () => {
    switch (selectedDatabaseType) {
      case "S3":
        return (
          <S3DatabaseDialog
            onOpenChange={(open) => {
              onOpenChange(open);
              if (!open) {
                setSelectedDatabaseType(null);
              }
            }}
            open={open}
          />
        );
      default:
        return (
          <DatabaseTypeSelectorDialog
            onTypeSelect={setSelectedDatabaseType}
            onOpenChange={onOpenChange}
            open={open}
          />
        );
    }
  };

  return renderDialog();
}
