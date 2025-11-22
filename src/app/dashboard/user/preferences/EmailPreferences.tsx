"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/src/components/ui/item";
import { Button } from "@/src/components/ui/button";
import { Edit, Mail, MailCheck } from "lucide-react";
import React, { useState } from "react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "sonner";
// Removed unused dialog imports
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";
import { authClient } from "@/src/lib/auth-client";
import FormDialog from "@/src/components/Dialogs/FormDialog";

const CardComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>{children}</CardContent>
    </Card>
  );
};

const SkeletonComponent = () => {
  return (
    <CardComponent>
      <Item variant={"outline"}>
        <ItemMedia variant={"icon"}>
          <Mail />
        </ItemMedia>
        <ItemContent>
          <Skeleton className={"min-w-32 w-full max-w-1/3 h-4"} />
        </ItemContent>
        <ItemActions>
          <Skeleton className={"h-8 w-16"} />
        </ItemActions>
      </Item>
    </CardComponent>
  );
};

export default function EmailPreferences() {
  const { data, isPending, refetch } = authClient.useSession();
  const user = data?.user;

  const [isSending, setIsSending] = useState(false);

  // Change email form
  const formSchema = z
    .object({
      email: z
        .email({ error: "Please enter a valid email address" })
        .max(254, { error: "Email must be 254 characters or less" }),
    })
    .refine((values) => values.email !== data?.user?.email, {
      error: "The new email address cannot be the same as your current email.",
      path: ["email"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleEmailChange = async (values: { email: string }) => {
    const toasterId = toast.loading("Changing email address...");
    const isVerified = user?.emailVerified;

    await authClient.changeEmail({
      newEmail: values.email,
      callbackURL: "/dashboard/user/preferences",
      fetchOptions: {
        onSuccess: () => {
          toast.success(
            isVerified
              ? `A link was sent to ${user.email} to update your email!`
              : "Successfully changed your email address!",
            {
              id: toasterId,
            }
          );
          form.reset();
        },
        onError: (error) => {
          toast.error(error.error.message, { id: toasterId });
        },
      },
    });
    refetch(); // Refetch data to display email change
  };

  // Verify email logic
  const handleVerify = async () => {
    setIsSending(true);
    const toasterId = toast.loading("Sending verification email...");

    await authClient.sendVerificationEmail({
      email: user!.email,
      callbackURL: "/dashboard/user/preferences",
      fetchOptions: {
        onSuccess: () => {
          toast.success(
            `Sent verification email to ${
              user!.email
            }! Please check your inbox.`,
            { id: toasterId }
          );
        },
        onError: (error) => {
          toast.error(error.error.message, { id: toasterId });
        },
      },
    });
    setIsSending(false);
  };

  // Fallback
  if (isPending || !user) {
    return <SkeletonComponent />;
  }

  // Component
  return (
    <CardComponent>
      <Item variant={"outline"}>
        <ItemMedia variant={"icon"}>
          <Mail />
        </ItemMedia>
        <ItemContent className="flex-row">
          <ItemTitle>{data.user?.email}</ItemTitle>
          {/* Dialog form */}
          <FormDialog
            title="Update Email"
            description="Enter your new email address and password below to update your email. A link will be sent to the new address to update your email."
            trigger={
              <Button variant="ghost" size="icon-sm" type="button">
                <Edit />
              </Button>
            }
            submitButtonText="Save"
            form={form}
            callback={handleEmailChange}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="new@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </FormDialog>
        </ItemContent>
        <ItemActions>
          {/* Verify button */}
          <Button
            variant={"outline"}
            disabled={isSending || data.user?.emailVerified}
            onClick={handleVerify}
          >
            {data.user?.emailVerified ? (
              <>
                <MailCheck /> <span>Verified</span>{" "}
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </ItemActions>
      </Item>
    </CardComponent>
  );
}
