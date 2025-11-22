import FormDialog from "@/src/components/Dialogs/FormDialog";
import { PasswordConfirmationDialog } from "@/src/components/Dialogs/PasswordConfirmationDialog";
import { Button } from "@/src/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/components/ui/item";
import { QRCode } from "@/src/components/ui/shadcn-io/qr-code";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useCopyToClipboard } from "@/src/hooks/useCopyToClipboard";
import { authClient } from "@/src/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, ScanFace } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const ItemComponent = ({ children }: React.PropsWithChildren) => {
  return (
    <Item variant={"outline"}>
      <ItemMedia variant={"icon"}>
        <ScanFace />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Authenticator App (TOTP)</ItemTitle>
        <ItemDescription>
          Authenticate using a third-party TOTP app like Google Authenticator
        </ItemDescription>
      </ItemContent>
      <ItemActions>{children}</ItemActions>
    </Item>
  );
};

const Enroll2FADialog = ({
  children,
  totpUri,
  callback,
}: {
  children: React.ReactNode;
  totpUri: URL;
  callback: (password: string) => void;
}) => {
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const [isOpen, setIsOpen] = useState(true);
  const formSchema = z.object({
    code: z
      .string()
      .length(6, { error: "Your one-time password must be 6 characters" })
      .regex(/^\d{6}$/, "TOTP code must contain only digits"),
  });
  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const secret = totpUri.searchParams.get("secret");
  return (
    <FormDialog
      form={form}
      callback={(data) => callback(data.code)}
      title="Verify TOTP"
      description="Scan the QR code with an authenticator app and provide the given code to confirm enrolment"
      trigger={children}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="w-full flex flex-col items-center mb-4 gap-4">
        <QRCode
          data={totpUri.href}
          className="size-48 rounded p-4 bg-white"
        ></QRCode>
        <InputGroup>
          <InputGroupInput placeholder={secret ?? "No secret found"} readOnly />
          <InputGroupAddon align={"inline-end"}>
            <InputGroupButton
              onClick={() => {
                if (secret) copyToClipboard(secret);
              }}
              size={"icon-xs"}
              disabled={!secret}
            >
              {copiedText ? <Check /> : <Copy />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
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
};

export default function TotpItemSecurity() {
  const { data, isPending } = authClient.useSession();
  const [totpQrCode, setTotpQrCode] = useState<URL>();

  const user = data?.user;

  const handle2FAEnable = async (password: string) => {
    const toasterId = toast.loading("Enabling 2FA...");
    const { data, error } = await authClient.twoFactor.enable({
      password,
      issuer: "rManager",
    });

    if (error) {
      toast.error(error.message, { id: toasterId });
      return;
    }

    try {
      const url = new URL(data.totpURI);
      setTotpQrCode(url);
    } catch {
      toast.error("There was an error while enabling 2FA: Invalid TOTP Uri", {
        id: toasterId,
      });
    }

    toast.dismiss(toasterId);
  };

  const confirmTotpEnrolment = async (code: string) => {
    const toasterId = toast.loading("Verifying TOTP code...");
    const { error } = await authClient.twoFactor.verifyTotp({ code });
    if (error) {
      toast.error(
        error.code === "INVALID_TWO_FACTOR_COOKIE"
          ? "Invalid authentication code."
          : error.message,
        { id: toasterId }
      );
      return;
    }
    toast.success("Successfully added TOTP Authentication to your account!", {
      id: toasterId,
    });
    setTotpQrCode(undefined);
  };

  const handle2FADisable = async (password: string) => {
    const toasterId = toast.loading("Disabling 2FA...");
    const { error } = await authClient.twoFactor.disable({ password });

    if (error) {
      toast.error(error.message, { id: toasterId });
      return;
    }

    toast.success("Successfully disabled 2FA from your account!", {
      id: toasterId,
    });
  };

  if (!user || isPending) {
    return (
      <ItemComponent>
        <Skeleton className="h-8 w-16" />
      </ItemComponent>
    );
  }

  return (
    <ItemComponent>
      {!user.twoFactorEnabled && totpQrCode && (
        <Enroll2FADialog callback={confirmTotpEnrolment} totpUri={totpQrCode}>
          <Button variant={"outline"}>Enable</Button>
        </Enroll2FADialog>
      )}

      {!totpQrCode && !user.twoFactorEnabled && (
        <PasswordConfirmationDialog
          title="Enable 2FA for your account"
          description="Please enter your password to enable 2FA. You will be prompted to scan a QR code using your third party TOTP app."
          submitButtonText="Enable 2FA"
          callback={handle2FAEnable}
        >
          <Button variant={"outline"}>Enable</Button>
        </PasswordConfirmationDialog>
      )}

      {user.twoFactorEnabled && (
        <PasswordConfirmationDialog
          title="Disable 2FA Authentication"
          description="Disabling 2FA will remove an important security layer from your account. You will no longer be required to enter a unique verification code when you log in on new devices."
          submitButtonText="Disable 2FA"
          submitButtonVariant={"destructive"}
          inputClassName="focus-visible:ring-destructive/40 focus-visible:border-destructive"
          callback={handle2FADisable}
        >
          <Button variant={"outline"}>Disable</Button>
        </PasswordConfirmationDialog>
      )}
    </ItemComponent>
  );
}
