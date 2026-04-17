// components/ui/PasswordConfirmationDialog.tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import FormDialog from "@/src/components/FormDialog";

// Schema for password validation (customize as needed)
const formSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof formSchema>;

interface PasswordConfirmationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  submitButtonText: string;
  submitButtonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null;
  inputClassName?: string;
  callback: (password: string) => void | Promise<void>;
}

export function PasswordConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  submitButtonText,
  submitButtonVariant = "default",
  inputClassName = "",
  callback,
  children,
}: PasswordConfirmationDialogProps & React.PropsWithChildren) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "" },
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      submitButtonText={submitButtonText}
      submitButtonVariant={submitButtonVariant}
      trigger={children}
      form={form}
      callback={(data) => callback(data.password)}
    >
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                placeholder="Password"
                type="password"
                className={inputClassName}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
