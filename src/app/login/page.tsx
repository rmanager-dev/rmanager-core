"use client";
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
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const handleLogin = async (callback: () => Promise<UserCredential>) => {
    try {
      setIsLoading(true);
      const userCreds = await callback();
      const idToken = await userCreds.user.getIdToken();

      if (!idToken) {
        throw new Error(
          "Error while logging you in: error while retrieving token"
        );
      }

      // Exange idToken against session cookie
      const response = await fetch("/api/auth/getSessionCookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error(
          "Error while logging you in: error while retrieving cookie"
        );
      }

      toast.success("Logged in successfully");
      router.push("/");
    } catch (error: unknown) {
      // Non firebase errors (errors while getting cookie from server)
      if (typeof error != "object") {
        auth.signOut();
        console.log(error);
        toast.error("There was an error while loggin in", {
          description: error as string,
        });
        return;
      }

      // Firebase errors
      const code = (error as FirebaseError).code;
      switch (code) {
        case "auth/popup-closed-by-user":
          break;
        case "auth/invalid-credential":
          form.setError("password", { message: "Invalid email/password" });
          break;
        default:
          console.log(error);
          toast.error("There was an error while loggin in", {
            description: code,
          });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithEmail = async (email: string, password: string) => {
    handleLogin(() => signInWithEmailAndPassword(auth, email, password));
  };

  return (
    <div className="min-h-full flex justify-center items-center bg-background">
      <Card className="w-full max-w-md m-12">
        <CardHeader>
          <CardTitle>Welcome back!</CardTitle>
          <CardDescription>
            Enter your email and password to login to your account
          </CardDescription>
          <CardAction>
            <Button variant={"ghost"} asChild>
              <Link href={"/signup"}>Sign Up</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              handleLoginWithEmail(values.email, values.password)
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
                      <div className="flex justify-between">
                        <FormLabel>Password</FormLabel>
                        <a
                          href="#"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot password?
                        </a>
                      </div>
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
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                Login
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
