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

interface LoginCardProps {
  setIsLogin: (isLogin: boolean) => void;
  loginWithEmail: (email: string, password: string) => void;
  thirdPartyLogin: (provider: string) => void;
}

export default function LoginCard({
  setIsLogin,
  loginWithEmail,
  thirdPartyLogin,
}: LoginCardProps) {
  // Create form info based on rules defined above
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back!</CardTitle>
        <CardDescription>
          Enter your email and password to login to your account
        </CardDescription>
        <CardAction>
          <Button variant={"ghost"} onClick={() => setIsLogin(false)}>
            Sign Up
          </Button>
        </CardAction>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) =>
            loginWithEmail(values.email, values.password)
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
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Separator className="w-full h-[1px] bg-neutral-700" />
            <div className="flex flex-col justify-center gap-4 w-full">
              <Button
                variant={"outline"}
                type="button"
                className="w-full"
                onClick={() => thirdPartyLogin("google")}
              >
                <FaGoogle /> Login with Google
              </Button>
              <Button
                variant={"outline"}
                type="button"
                className="w-full"
                onClick={() => thirdPartyLogin("github")}
              >
                <FaGithub /> Login with Github
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
