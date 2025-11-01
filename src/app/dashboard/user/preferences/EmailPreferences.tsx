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
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/ui/button";
import { Edit, Mail, MailCheck } from "lucide-react";
import React, { useState } from "react";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
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
  const { user, loading } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Change email form
  const formSchema = z
    .object({
      email: z
        .string({ error: "Email must be a string of characters" })
        .max(254, { error: "Email must be 254 characters or less" })
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { error: "Invalid email format" }),
      password: z
        .string({ error: "Password must be a string of characters" })
        .min(1, { error: "Password must not be empty" }),
    })
    .refine((data) => data.email !== user?.email, {
      error: "The new email address cannot be the same as your current email.",
      path: ["email"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleEmailChange = async (data: {
    email: string;
    password: string;
  }) => {
    const credentials = EmailAuthProvider.credential(
      user!.email!,
      data.password
    );
    const success = await reauthenticateWithCredential(user!, credentials)
      .then(() => true)
      .catch(() => false);
    if (!success) {
      form.setError("password", { message: "Invalid password" });
      return;
    }
    toast.promise(verifyBeforeUpdateEmail(user!, data.email), {
      loading: "Sending confirmation email...",
      success: "A link was sent to your new address to update your email!",
      error:
        "Something went wrong when sending a confirmation email to your new address. Please try again later.",
      finally: () => {
        form.reset();
        setIsDialogOpen(false);
      },
    });
  };

  // Verify email logic
  const handleVerify = () => {
    setIsSending(true);
    toast.promise(sendEmailVerification(user!), {
      loading: "Sending verification email...",
      success: "Sent verification email! Please check your inbox.",
      error: (error) => {
        console.log(error);
        const code = (error as FirebaseError).code;
        switch (code) {
          case "auth/too-many-requests":
            return "Please wait before sending another verification email.";
          default:
            return "Something went wrong when trying to send verification email. Please try again later.";
        }
      },
      finally: () => {
        setIsSending(false);
      },
    });
  };

  // Fallback
  if (loading || !user) {
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
          <ItemTitle>{user?.email}</ItemTitle>
          {/* Dialog form */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Form {...form}>
              {/* Edit button */}
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon-sm" type="button">
                  <Edit />
                </Button>
              </DialogTrigger>

              {/* Dialog content */}
              <DialogContent>
                <form
                  onSubmit={form.handleSubmit(handleEmailChange)}
                  className="flex flex-col gap-4"
                >
                  <DialogHeader>
                    <DialogTitle>Update Email</DialogTitle>
                    <DialogDescription>
                      Enter your new email address and password below to update
                      your email. A link will be sent to the new address to
                      update your email.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Email Form Input */}
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
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Password"
                            {...field}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  ></FormField>

                  {/* Dialog Buttons */}
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant={"outline"}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Form>
          </Dialog>
        </ItemContent>
        <ItemActions>
          {/* Verify button */}
          <Button
            variant={"outline"}
            disabled={isSending || user?.emailVerified}
            onClick={handleVerify}
          >
            {user?.emailVerified ? (
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
