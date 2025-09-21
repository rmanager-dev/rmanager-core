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
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-separator";
import { useForm } from "react-hook-form";
import { FaGithub, FaGoogle } from "react-icons/fa";
import z from "zod";
///////////////////////////////////////////////////////////////////////////////

// Object used to define rules for form items
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

interface SignupCardProps {
  setIsLogin: (isLogin: boolean) => void;
  signupWithEmail: (email: string, password: string) => void;
  thirdPartySignup: (provider: string) => void;
}

export default function SignupCard({
  setIsLogin,
  signupWithEmail,
  thirdPartySignup,
}: SignupCardProps) {
  // Create form info based on rules defined above
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter an email and password to create an account
        </CardDescription>
        <CardAction>
          <Button variant={"ghost"} onClick={() => setIsLogin(true)}>
            Login
          </Button>
        </CardAction>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) =>
            signupWithEmail(values.email, values.password)
          )}
          className="space-y-4"
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
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
            <Separator className="w-full h-[1px] bg-neutral-700" />
            <div className="flex flex-col justify-center gap-4 w-full">
              <Button
                variant={"outline"}
                type="button"
                className="w-full"
                onClick={() => thirdPartySignup("google")}
              >
                <FaGoogle /> Sign Up with Google
              </Button>
              <Button
                variant={"outline"}
                type="button"
                className="w-full"
                onClick={() => thirdPartySignup("github")}
              >
                <FaGithub /> Sign Up with Github
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
