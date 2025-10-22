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
import { auth } from "@/src/lib/firebase/firebaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  UserCredential,
} from "firebase/auth";
import Link from "next/link";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/src/components/ui/empty";

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

  // Create form info based on rules defined above
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handeSignup = async (callback: () => Promise<UserCredential>) => {
    try {
      setIsLoading(true);
      const signupPromise = callback();

      toast.promise<UserCredential>(signupPromise, {
        loading: "Creating your account...",
        success: async (userCredentials) => {
          const user = userCredentials.user;
          if (user) {
            await sendEmailVerification(user);
            return "Created your account successfully! Please check your email to verify your account.";
          } else {
            return "Created your account successfully!";
          }
        },
        error: (error) => {
          const code = (error as FirebaseError).code;
          console.log(error);
          switch (code) {
            case "auth/email-already-in-use":
              return "Account already exists.";
            default:
              return `There was an error while creating your account: ${code}`;
          }
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (email: string, password: string) => {
    await handeSignup(() =>
      createUserWithEmailAndPassword(auth, email, password)
    );
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
                  <Link href={"/login"}>Login</Link>
                </Button>
              </span>
            </form>
          </Form>
        </EmptyContent>
      </Empty>
    </div>
  );
}
