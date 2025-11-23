"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import TotpItemSecurity from "./TotpItem";
import BackupCodesItemSecurity from "./BackupCodesItem";
import { authClient } from "@/src/lib/auth-client";

export default function TwoFactorSecurity() {
  const { data, isPending } = authClient.useSession();
  const user = data?.user;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Two Factor Authentication adds an additional layer of security by
          requiring a second authentication method.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <TotpItemSecurity />
      </CardContent>
      {user?.twoFactorEnabled && (
        <CardFooter>
          <BackupCodesItemSecurity />
        </CardFooter>
      )}
    </Card>
  );
}
