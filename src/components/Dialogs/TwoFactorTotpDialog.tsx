import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import FormDialog from "./FormDialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { authClient } from "@/src/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TwoFactorTotpDialog {
  open: boolean;
  onOpenChanged: (open: boolean) => void;
}

export default function TwoFactorTotpDialog({
  open,
  onOpenChanged,
}: TwoFactorTotpDialog) {
  const router = useRouter();

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
      title="Two Factor Authentication"
      description="To verify your identity, please provide a one-time passcode from your authenticator app"
      form={form}
      callback={(data) => handle2FAVerify(data.code)}
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
              <Input placeholder="XXXXXX" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
