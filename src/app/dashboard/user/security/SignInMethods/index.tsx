import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import PasswordMethodItem from "./PasswordMethodItem";

export default function SignInMethodsSecurity() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign In Methods</CardTitle>
        <CardDescription>
          Manage your sign-in methods for your account.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <PasswordMethodItem />
      </CardContent>
    </Card>
  );
}
