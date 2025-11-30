import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Check, Copy, Download } from "lucide-react";
import { useCopyToClipboard } from "@/src/hooks/useCopyToClipboard";
import { useDownloadFile } from "react-downloadfile-hook";

interface ViewBackupCodeDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  backupCodes: string[];
  children?: React.ReactNode;
}

export default function ViewBackupCodeDialog({
  open,
  onOpenChange,
  backupCodes,
  children,
}: ViewBackupCodeDialogProps) {
  const [canClose, setCanClose] = useState(false);
  const [copiedText, copy] = useCopyToClipboard();
  const [internalOpen, setInternalOpen] = useState(true);

  const { downloadFile } = useDownloadFile({
    fileName: "rmanager-backup-codes",
    format: "txt",
    data: backupCodes
      .map((value, index) => `${index + 1}: ${value}`)
      .join("\n"),
  });

  return (
    <Dialog
      open={open ?? internalOpen}
      onOpenChange={(newVal) => {
        if (newVal || canClose) {
          if (onOpenChange) {
            onOpenChange(newVal);
          } else {
            setInternalOpen(newVal);
          }
          setCanClose(false);
        }
      }}
      defaultOpen={true}
      modal={true}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Backup Codes</DialogTitle>
          <DialogDescription>
            Here are the newly generated backup codes. Put them in a safe place!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-1 bg-input/30 p-3 rounded-xl border">
            {backupCodes.map((code) => (
              <span key={code} className="text-center">
                {code}
              </span>
            ))}
          </div>
          <div className="flex gap-2 w-full">
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => {
                setCanClose(true);
                copy(
                  backupCodes
                    .map((value, index) => `${index + 1}: ${value}`)
                    .join("\n"),
                );
              }}
            >
              {copiedText ? <Check /> : <Copy />}
              <span>Copy</span>
            </Button>
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => {
                downloadFile();
                setCanClose(true);
              }}
            >
              <Download />
              <span>Download</span>
            </Button>
          </div>
        </div>
        <div className="flex gap-3">
          <Checkbox
            id="can-close-checkbox"
            checked={canClose}
            onCheckedChange={(val) => setCanClose(val as boolean)}
          />
          <Label htmlFor="can-close-checkbox">
            I have saved my backup codes
          </Label>
        </div>
        <DialogFooter>
          <DialogClose asChild className="w-full">
            <Button
              variant={"outline"}
              disabled={!canClose}
              onClick={() => setCanClose(false)}
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
