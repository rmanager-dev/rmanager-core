import { Button } from "@/src/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/src/components/ui/empty";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { authClient } from "@/src/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export default function SendResetLink() {
  const [isLoading, setIsLoading] = useState(false);
  const formSchema = z.object({
    email: z.email({ error: "Invalid email address" }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSendResetLink = async (email: string) => {
    setIsLoading(true);
    const toastId = toast.loading("Sending password reset link...");
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    if (error) {
      toast.error(error.message, { id: toastId });
    } else {
      toast.success(
        "Successfully sent password reset link! Please check your inbox.",
        { id: toastId },
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-dvh justify-center items-center">
      <Empty className="w-full p-10">
        <EmptyHeader>
          <EmptyTitle>Reset your password</EmptyTitle>
          <EmptyDescription>
            We will send you a link to reset your password
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Form {...form}>
            <form
              className="w-full flex flex-col gap-4"
              onSubmit={form.handleSubmit((data) =>
                handleSendResetLink(data.email),
              )}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        className="h-13 w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="h-13 w-full"
                disabled={isLoading || !form.formState.isValid}
              >
                Send Reset Link
              </Button>
              <Button
                className="h-13 w-full"
                variant={"outline"}
                type="button"
                asChild
              >
                <Link href={"/sign-in"}>Back To Login</Link>
              </Button>
            </form>
          </Form>
        </EmptyContent>
      </Empty>
    </div>
  );
}
