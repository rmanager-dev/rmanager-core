import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { authClient } from "@/src/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useState } from "react";
import FormDialog from "../FormDialog";

interface TotpTwoFactorDialogProps {
  open: boolean;
  onOpenChanged: (open: boolean) => void;
}

export default function TotpTwoFactorDialog({
  open,
  onOpenChanged,
}: TotpTwoFactorDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    code: z
      .string()
      .length(6, { error: "Your TOTP code must be 6 digits" })
      .regex(/^\d{6}$/, "TOTP code must contain only digits"),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const handle2FAVerify = async (code: string) => {
    const toasterId = toast.loading("Verifying your one-time passcode...");
    const { error } = await authClient.twoFactor.verifyTotp({ code });

    if (error) {
      toast.error(error.message, { id: toasterId });
      return;
    }

    toast.success("Successfully logged in!", { id: toasterId });
    router.replace("/dashboard");
  };

  return (
    <FormDialog
      form={form}
      callback={(data) => handle2FAVerify(data.code)}
      title="One-time Passcode Authentication"
      description="Enter a one-time passcode provided by your authenticator app to verify your identity."
      open={open}
      onOpenChange={onOpenChanged}
      submitButtonText="Login"
    >
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Authentication Code</FormLabel>
            <FormControl>
              <Input placeholder="XXXXXX" maxLength={6} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
