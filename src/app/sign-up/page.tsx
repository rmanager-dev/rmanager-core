"use client";
// Imports //
import { Button } from "@/src/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import { useState } from "react";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/src/components/ui/empty";
import { authClient } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";

// Object used to define rules for form items //
const formSchema = z
  .object({
    email: z
      .string()
      .max(254, { error: "Email must be 254 characters or less" })
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { error: "Invalid email format" }),

    password: z
      .string()
      .min(6, { error: "Password must be at least 6 characters" })
      .max(256, { error: "Password must not have more than 256 characters" }),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password == data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Component //
export default function SignupCard() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Create form info based on rules defined above
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleEmailSignup = async (email: string, password: string) => {
    setIsLoading(true);
    const toastId = toast.loading("Creating you account..."); // Create a loading toaster and store it's id
    authClient.signUp.email({
      email,
      password,
      name: email,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Account created successfully!", { id: toastId }); // Modify the toaster to indicate that the user was successfully signed up
          router.push("/dashboard");
        },
        onError: (error) => {
          toast.error(error.error.message, { id: toastId }); // If there was an error, modify the toaster to be an error toaster and indicate the error's message
        },
      },
      callbackURL: "/dashboard",
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center">
      <Empty className="w-full p-10">
        <EmptyHeader>
          <EmptyTitle className="text-3xl font-semibold">
            Sign Up to rManager
          </EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) =>
                handleEmailSignup(values.email, values.password)
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        className="h-13 w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
              <Button className="h-12 w-full" disabled={isLoading}>
                Sign Up
              </Button>

              <span className="text-muted-foreground font-semibold">
                Already have an account?{" "}
                <Button
                  className="text-blue-500 p-0 h-0 font-semibold"
                  variant={"link"}
                  asChild
                >
                  <Link href={"/sign-in"}>Login</Link>
                </Button>
              </span>
            </form>
          </Form>
        </EmptyContent>
      </Empty>
    </div>
  );
}
