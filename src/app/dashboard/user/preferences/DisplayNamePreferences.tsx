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
import { authClient } from "@/src/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const CardComponent = ({ children }: { children: React.ReactNode }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Display Name</CardTitle>
      <CardDescription>
        This display name will be used around the site
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
  const { data, isPending } = authClient.useSession();

  const formSchema = z
    .object({
      displayName: z
        .string()
        .max(32, { error: "Display name must be 32 characters at maximum" }),
    })
    .refine((data) => data.displayName.length > 0) // Ensure given display name isn't empty (without trigerring message)
    .refine((values) => values.displayName !== data?.user.name, {
      error:
        "Given display name must be different than your current display name",
    }); // Ensure given display name isn't equal to current display name

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
    },
  });

  const currentDisplayName = form.watch("displayName");
  const isDisabled =
    currentDisplayName == data?.user?.name || // Check if the given display name is equal to the past display name
    currentDisplayName.length < 1 || // Check if given display name is empty
    Object.keys(form.formState.errors).length > 0; // Check if form contains errors

  const handleDisplayNameChange = async (displayName: string) => {
    const toasterId = toast.loading("Updating display name...");

    await authClient.updateUser({
      name: displayName,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Successfully updated your display name!", {
            id: toasterId,
          });
        },
        onError: (error) => {
          toast.error(error.error.message, { id: toasterId });
        },
      },
    });

    form.reset();
  };

  if (isPending || !data?.user) {
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
                  <Input {...field} placeholder={data.user.name ?? ""} />
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
