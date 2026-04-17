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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface SetNewPasswordProps {
  token: string;
}
export default function SetNewPassword({ token }: SetNewPasswordProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formSchema = z
    .object({
      newPassword: z
        .string()
        .min(8, { error: "Password must be at least 8 characters" })
        .max(256, { error: "Password must not have more than 256 characters" }),

      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      error: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handlePasswordReset = async (newPassword: string) => {
    setIsLoading(true);
    const toastId = toast.loading("Resetting your password...");
    const { error } = await authClient.resetPassword({
      newPassword,
      token,
    });

    if (error) {
      toast.error(error.message, { id: toastId });
    } else {
      toast.success("Successfully reset your password!", { id: toastId });
    }

    setIsLoading(false);
    router.push("/sign-in");
  };

  return (
    <div className="flex min-h-dvh justify-center items-center">
      <Empty className="w-full p-10">
        <EmptyHeader>
          <EmptyTitle>Reset your password</EmptyTitle>
          <EmptyDescription>
            Enter your new password below
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Form {...form}>
            <form
              className="w-full flex flex-col gap-4"
              onSubmit={form.handleSubmit((data) =>
                handlePasswordReset(data.newPassword),
              )}
            >
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="New Password"
                        type="password"
                        className="h-13 w-full"
                        {...field}
                      />
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
                    <FormControl>
                      <Input
                        placeholder="Confirm Password"
                        type="password"
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
                Reset Password
              </Button>
            </form>
          </Form>
        </EmptyContent>
      </Empty>
    </div>
  );
}
