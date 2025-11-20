"use client";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import TotpItemSecurity from "./TotpItem";
import BackupCodesItemSecurity from "./BackupCodesItem";

export default function TwoFactorSecurity() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Two Factor Authentication adds an aditional layer of security by
          requiring a second authentication method.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <TotpItemSecurity />
      </CardContent>
      <CardFooter>
        <BackupCodesItemSecurity />
      </CardFooter>
    </Card>
  );
}
