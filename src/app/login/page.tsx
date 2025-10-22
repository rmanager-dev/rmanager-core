"use client";
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
import { auth } from "@/src/lib/firebase/firebaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
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

  // Create form info based on rules defined above
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handlers
  const handleLogin = async (callback: () => Promise<UserCredential>) => {
    try {
      setIsLoading(true);
      const loginPromise = callback();

      toast.promise(loginPromise, {
        loading: "Logging in...",
        success: () => {
          return "Logged in successfully";
        },
        error: (error) => {
          console.log(error);
          const code = (error as FirebaseError).code;
          switch (code) {
            case "auth/invalid-credential":
              return "Invalid credentials";
            default:
              return `There was an error while logging in: ${code}`;
          }
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithEmail = async (email: string, password: string) => {
    handleLogin(() => signInWithEmailAndPassword(auth, email, password));
  };

  return (
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
                  <Link href={"/signup"}>Sign Up</Link>
                </Button>
              </span>
            </form>
          </Form>
        </EmptyContent>
      </Empty>
    </div>
  );
}
