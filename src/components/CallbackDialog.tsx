import React from "react";
import { Form } from "./ui/form";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface CallbackDialogProps {
  title: string;
  description?: string;
  submitButtonText: string;
  submitButtonVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  cancelButtonText: string;
  cancelButtonVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  callback: () => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CallbackDialog({
  title,
  description,
  submitButtonText,
  submitButtonVariant,
  cancelButtonText,
  cancelButtonVariant,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  callback,
  children,
}: CallbackDialogProps & React.PropsWithChildren) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = controlledOpen ?? internalOpen;
  const setIsOpen = setControlledOpen ?? setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:flex-col gap-4">
          <Button
            variant={submitButtonVariant}
            disabled={isLoading}
            className="w-full"
            onClick={async () => {
              try {
                setIsLoading(true);
                await callback();
              } catch (error) {
                console.log(error);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {submitButtonText}
          </Button>
          <DialogClose asChild className="w-full">
            <Button variant={cancelButtonVariant}>{cancelButtonText}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
