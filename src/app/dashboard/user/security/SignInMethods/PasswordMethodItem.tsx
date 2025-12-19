"use client";
import FormDialog from "@/src/components/FormDialog";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/components/ui/item";
import { Label } from "@/src/components/ui/label";
import { Skeleton } from "@/src/components/ui/skeleton";
import { authClient } from "@/src/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const ItemComponent = ({ children }: React.PropsWithChildren) => (
  <Item variant={"outline"}>
    <ItemMedia variant={"icon"}>
      <KeyIcon />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>Password</ItemTitle>
      <ItemDescription>Sign in with your email and password</ItemDescription>
    </ItemContent>
    <ItemActions>{children}</ItemActions>
  </Item>
);

export default function PasswordMethodItem() {
  const { data, isPending } = authClient.useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const user = data?.user;

  const formSchema = z
    .object({
      password: z.string().min(1, { error: "Password is required" }),
      newPassword: z
        .string()
        .min(6, { error: "Password must be at least 6 characters" })
        .max(256, { error: "Password must be at most 256 characters" }),
      confirmPassword: z
        .string()
        .min(1, { error: "Confirm password is required" }),
      signOutOfAllDevices: z.boolean(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      error: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      confirmPassword: "",
      signOutOfAllDevices: false,
    },
  });

  const handlePasswordChange = async (
    currentPassword: string,
    newPassword: string,
    signOutOfAllDevices: boolean,
  ) => {
    const toasterId = toast.loading("Changing password...");
    await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: signOutOfAllDevices,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Password changed successfully", { id: toasterId });
          setIsDialogOpen(false);
        },
        onError: (error) => {
          toast.error(error.error.message, { id: toasterId });
        },
      },
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
      <FormDialog
        title="Change password"
        description=""
        trigger={<Button variant="outline">Change password</Button>}
        callback={async (data) => {
          await handlePasswordChange(
            data.password,
            data.newPassword,
            data.signOutOfAllDevices,
          );
        }}
        form={form}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} maxLength={256} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} maxLength={256} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="signOutOfAllDevices"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex gap-3">
                  <Checkbox
                    id="sign-out-all-devices"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="sign-out-all-devices">
                    Sign out of all other devices
                  </Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormDialog>
    </ItemComponent>
  );
}
