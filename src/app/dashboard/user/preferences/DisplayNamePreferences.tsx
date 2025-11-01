"use client";
import { Button } from "@/src/components/ui/button";
import {
  Card,
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
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useAuth } from "@/src/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfile } from "firebase/auth";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const CardComponent = ({ children }: { children: React.ReactNode }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Display Name</CardTitle>
      <CardDescription>
        This display name will be used arround the site
      </CardDescription>
    </CardHeader>
    <Separator />
    <CardFooter>{children}</CardFooter>
  </Card>
);

const SkeletonComponent = () => (
  <CardComponent>
    <div className="w-full flex justify-between gap-3">
      <Skeleton className="h-8 w-full max-w-lg" />
      <Skeleton className={"h-8 w-16"} />
    </div>
  </CardComponent>
);

export default function DisplayNamePreferences() {
  const { user, loading } = useAuth();

  const formSchema = z
    .object({
      displayName: z
        .string()
        .max(32, { error: "Display name must be 32 characters at maximum" }),
    })
    .refine((data) => data.displayName.length > 0) // Ensure given display name isn't empty (without trigerring message)
    .refine((data) => data.displayName !== user?.displayName, {
      error:
        "Given display name must be different than your current display name",
    }); // Ensure given display name isn't equal to current display name

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user?.displayName ?? "",
    },
  });

  const currentDisplayName = form.watch("displayName");
  const isDisabled =
    currentDisplayName == user?.displayName || // Check if the given display name is equal to the past display name
    currentDisplayName.length < 1 || // Check if given display name is empty
    Object.keys(form.formState.errors).length > 0; // Check if form contains errors

  const handleDisplayNameChange = (displayName: string) => {
    toast.promise(updateProfile(user!, { displayName }), {
      loading: "Updating your display name...",
      success: "Successfully updated your display name!",
      error: "There was an error while updating your display name.",
      finally: () => {
        form.reset({ displayName: "" });
      },
    });
  };

  if (loading || !user) {
    return <SkeletonComponent />;
  }

  return (
    <CardComponent>
      <Form {...form}>
        <form
          className="w-full flex justify-between gap-3"
          onSubmit={form.handleSubmit((data) =>
            handleDisplayNameChange(data.displayName)
          )}
        >
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem className="w-full max-w-lg">
                <FormControl>
                  <Input {...field} placeholder={user.displayName ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          <Button disabled={isDisabled}>Save</Button>
        </form>
      </Form>
    </CardComponent>
  );
}
