import React, { useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormDialog from "./FormDialog";
import { Input } from "./ui/input";

type FormDialogProps = React.ComponentProps<typeof FormDialog>;
interface CallbackDialogProps extends Omit<
  FormDialogProps,
  "form" | "children"
> {
  confirmationText?: string;
}

export default function CallbackDialog({
  open,
  onOpenChange,
  callback,
  confirmationText,
  submitButtonVariant = "destructive",
  cancelButtonVariant = "outline",
  cancelButtonText = "Cancel",
  ...props
}: CallbackDialogProps) {
  const formSchema = z.object({
    confirm: confirmationText
      ? z.string().refine((val) => val === confirmationText, {
          error: "Text doesn't match required value",
        })
      : z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirm: "",
    },
  });

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  return (
    <FormDialog
      {...props}
      submitButtonVariant={submitButtonVariant}
      cancelButtonText={cancelButtonText}
      cancelButtonVariant={cancelButtonVariant}
      callback={callback}
      form={form}
      open={open}
      onOpenChange={onOpenChange}
    >
      {confirmationText ? (
        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Please type "{confirmationText}" below to continue
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the value above"
                  aria-invalid
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </FormDialog>
  );
}
