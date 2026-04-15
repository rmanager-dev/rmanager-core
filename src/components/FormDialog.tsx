import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Form } from "@/src/components/ui/form";
import React, { useState } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

export interface FormDialogProps<TFormData extends FieldValues> {
  title: string;
  description: string;
  cancelButtonText?: string;
  cancelButtonVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  submitButtonText?: string;
  submitButtonVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  trigger?: React.ReactNode;
  form: UseFormReturn<TFormData>;
  callback: (data: TFormData) => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function FormDialog<TFormData extends FieldValues>({
  title,
  description,
  cancelButtonText = "Cancel",
  cancelButtonVariant = "outline",
  submitButtonText = "Confirm",
  submitButtonVariant = "default",
  trigger,
  form,
  callback,
  open: externalOpen,
  onOpenChange: setExternalOpen,
  children,
}: FormDialogProps<TFormData> & React.PropsWithChildren) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const open = externalOpen ?? internalOpen;
  const onOpenChange = setExternalOpen ?? setInternalOpen;

  const handleSubmit = async (data: TFormData) => {
    setIsLoading(true);
    try {
      await callback(data);
      onOpenChange(false);
      form.reset();
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <Form {...form}>
        <DialogContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {children}
            <DialogFooter className="flex sm:flex-col gap-4">
              <Button
                type="submit"
                variant={submitButtonVariant}
                disabled={isLoading || !form.formState.isValid}
                className="w-full"
              >
                {submitButtonText}
              </Button>
              <DialogClose asChild className="w-full">
                <Button variant={cancelButtonVariant}>{cancelButtonText}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );
}
