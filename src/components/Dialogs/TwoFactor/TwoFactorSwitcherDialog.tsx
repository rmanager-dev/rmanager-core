import { ChevronRightIcon, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import React from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "../../ui/item";
import { Button } from "../../ui/button";

interface TwoFactorSwitcherDialogProps {
  open: boolean;
  onOpenChanged: (open: boolean) => void;
  setCurrentDialog: (dialog: "switch" | "totp") => any;
}

interface AuthenticationMethodType {
  name: string;
  description: string;
  dialogName: "switch" | "totp";
  Icon: typeof KeyRound;
}

const AuthenticationMethods: AuthenticationMethodType[] = [
  {
    name: "One-time Passcode",
    description:
      "Authenticate using a one time passcode from your authenticator app",
    dialogName: "totp",
    Icon: KeyRound,
  },
];

export default function TwoFactorSwitcherDialog({
  open,
  onOpenChanged,
  setCurrentDialog,
}: TwoFactorSwitcherDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChanged}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a 2FA Authentication method</DialogTitle>
          <DialogDescription>
            Select a supported 2FA Authentication method below to verify your
            identity
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {AuthenticationMethods.map((method) => (
            <Item
              variant={"outline"}
              size={"sm"}
              className="w-full"
              key={method.name}
              asChild
            >
              <Button
                type="button"
                variant={"outline"}
                className="size-full"
                onClick={() => setCurrentDialog(method.dialogName)}
              >
                <ItemMedia variant={"icon"}>
                  <method.Icon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{method.name}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <ChevronRightIcon className="size-4" />
                </ItemActions>
              </Button>
            </Item>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
