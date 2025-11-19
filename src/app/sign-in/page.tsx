"use client";
import TwoFactorTotpDialog from "@/src/components/Dialogs/TwoFactorTotpDialog";
import { Button } from "@/src/components/ui/button";
import {
  Empty,
  EmptyContent,
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z, { any } from "zod";
///////////////////////////////////////////////////////////////////////

// Object used to define rules for form items
const formSchema = z.object({
  email: z
    .string()
    .max(254, { error: "Email must be 254 characters or less" })
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { error: "Invalid email format" }),

  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters" })
    .max(256, { error: "Password must not have more than 256 characters" }),
});

export default function LoginCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);
  const router = useRouter();

  // Create form info based on rules defined above
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handlers
  const handleLoginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);

    // Create a loading toaster and store it's ID
    const toastId = toast.loading("Logging in...");

    await authClient.signIn.email({
      email,
      password,
      fetchOptions: {
        onSuccess: (ctx) => {
          if (ctx.data.twoFactorRedirect) {
            toast.dismiss(toastId);
            setIs2FADialogOpen(true);
            return;
          }
          toast.success("Successfully logged in!", { id: toastId }); // If the signIn was successfull, modify the previously created toaster
          router.replace("/dashboard");
        },
        onError: (error) => {
          toast.error(error.error.message, { id: toastId }); // If there was an error, indicate what went wrong
        },
      },
    });
    setIsLoading(false);
  };

  return (
    <>
      <TwoFactorTotpDialog
        open={is2FADialogOpen}
        onOpenChanged={setIs2FADialogOpen}
      />
      <div className="min-h-dvh flex flex-col items-center">
        <Empty className="w-full p-10">
          <EmptyHeader>
            <EmptyTitle className="text-3xl font-semibold">
              Login to rManager
            </EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  handleLoginWithEmail(values.email, values.password)
                )}
                className="w-full flex flex-col gap-4"
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
                ></FormField>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Password"
                          className="h-13 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <Button
                  className="text-muted-foreground h-0 font-semibold"
                  variant={"link"}
                  asChild
                >
                  <Link href={"/forgot"}>Forgot password?</Link>
                </Button>
                <Button className="h-12 w-full" disabled={isLoading}>
                  Login
                </Button>

                <span className="text-muted-foreground font-semibold">
                  Dont have an account?{" "}
                  <Button
                    className="text-blue-500 p-0 h-0 font-semibold"
                    variant={"link"}
                    asChild
                  >
                    <Link href={"/sign-up"}>Sign Up</Link>
                  </Button>
                </span>
              </form>
            </Form>
          </EmptyContent>
        </Empty>
      </div>
    </>
  );
}
