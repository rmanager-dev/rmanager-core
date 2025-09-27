"use client";
// Imports //
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { auth } from "@/src/lib/firebase/firebaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, UserCredential } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { FirebaseError } from "firebase/app";

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

  const handeSignup = async (callback: () => Promise<UserCredential>) => {
    try {
      setIsLoading(true);
      await callback();

      toast.success("Signed up successfully");
      router.push("/");
    } catch (error: unknown) {
      // Firebase errors
      const code = (error as FirebaseError).code;
      switch (code) {
        case "auth/popup-closed-by-user":
          break;
        case "auth/email-already-in-use":
          toast.warning("Account already exist");
          break;
        default:
          console.log(error);
          toast.error("There was an error while signing up", {
            description: code,
          });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (email: string, password: string) => {
    handeSignup(() => createUserWithEmailAndPassword(auth, email, password));
  };

  return (
    <div className="relative min-h-full flex justify-center items-center bg-background">
      <Card className="w-full max-w-md m-12">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter an email and password to create an account
          </CardDescription>
          <CardAction>
            <Button variant={"ghost"} asChild>
              <Link href={"/login"}>Login</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              handleEmailSignup(values.email, values.password)
            )}
            className="space-y-6"
          >
            <CardContent>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type={"password"}
                          placeholder="Password"
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
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type={"password"}
                          placeholder="Confirm Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                Sign Up
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
