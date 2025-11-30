import { authClient } from "@/src/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import FormDialog from "../FormDialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import TrustDeviceCheckbox from "./TrustDeviceCheckbox";
import { Input } from "../ui/input";

interface BackupCodeTwoFactorDialogProps {
  open: boolean;
  onOpenChanged: (open: boolean) => void;
}

export default function BackupCodeTwoFactorDialog({
  open,
  onOpenChanged,
}: BackupCodeTwoFactorDialogProps) {
  const router = useRouter();

  const formSchema = z.object({
    code: z.string().length(11, "Your backup code must be 10 characters."), // Account for the dash
    trustDevice: z.boolean(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      trustDevice: false,
    },
  });

  const handleBackupCodeVerify = async (code: string, trustDevice: boolean) => {
    const toasterId = toast.loading("Verifying backup code...");
    const { error } = await authClient.twoFactor.verifyBackupCode({
      code,
      trustDevice,
    });

    if (error) {
      toast.error(error.message ?? "Error while verifying backup code", {
        id: toasterId,
      });
      return;
    }

    toast.success("Successfully logged in!", { id: toasterId });
    router.replace("/dashboard");
  };

  return (
    <FormDialog
      title="Backup Code Authentication"
      description="Enter a valid backup code to verify your identity"
      submitButtonText="Login"
      cancelButtonText="Use another method"
      form={form}
      callback={(data) => handleBackupCodeVerify(data.code, data.trustDevice)}
      open={open}
      onOpenChange={onOpenChanged}
    >
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Backup Code</FormLabel>
            <FormControl>
              <Input placeholder="XXXXXX" maxLength={11} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <TrustDeviceCheckbox form={form} />
    </FormDialog>
  );
}
