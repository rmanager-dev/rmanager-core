"use client";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/components/ui/item";
import { Separator } from "@/src/components/ui/separator";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useAuth } from "@/src/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { TriangleAlert } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const CardComponent = ({ children }: { children: React.ReactNode }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>DANGER ZONE</CardTitle>
    </CardHeader>
    <Separator />
    <CardContent>{children}</CardContent>
  </Card>
);

const SkeletonComponent = () => (
  <CardComponent>
    <Item variant={"outline"} className="border-destructive bg-destructive/5">
      <ItemMedia variant={"icon"} className="border-none bg-destructive">
        <TriangleAlert className="stroke-destructive-foreground" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Delete account</ItemTitle>
        <ItemDescription>
          Your account will be instantly deleted with all of it's data. This
          action is irreversible. You will be prompted to enter your password
          before deletion.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Skeleton className={"h-8 w-40"} />
      </ItemActions>
    </Item>
  </CardComponent>
);

export default function DangerZonePreferences() {
  const { user, loading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formSchema = z.object({
    password: z
      .string({ error: "Password must be a string of characters" })
      .min(1, { error: "Password must not be empty" }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleAccountDeletion = async (password: string) => {
    const credentials = EmailAuthProvider.credential(user!.email!, password);
    const success = await reauthenticateWithCredential(user!, credentials)
      .then(() => true)
      .catch(() => false);

    if (!success) {
      form.setError("password", { message: "Invalid password" });
      return;
    }
    toast.promise(deleteUser(user!), {
      loading: "Deleting your account...",
      success: "Successfully deleted your account!",
      error: "There was an error while deleting your account",
      finally: () => {
        setIsDialogOpen(false);
      },
    });
  };

  if (loading || !user) {
    return <SkeletonComponent />;
  }

  return (
    <CardComponent>
      <Item variant={"outline"} className="border-destructive bg-destructive/5">
        <ItemMedia variant={"icon"} className="border-none bg-destructive">
          <TriangleAlert className="stroke-destructive-foreground" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Delete account</ItemTitle>
          <ItemDescription>
            Your account will be instantly deleted with all of it's data. This
            action is irreversible. You will be prompted to enter your password
            before deletion.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={"destructive"}>Delete my account</Button>
            </DialogTrigger>
            <Form {...form}>
              <DialogContent>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    handleAccountDeletion(data.password)
                  )}
                  className="flex flex-col gap-4"
                >
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      Type your password below to permanently delete your
                      account. This action is irreversible.
                    </DialogDescription>
                  </DialogHeader>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Password"
                            type="password"
                            className="focus-visible:ring-destructive/40 focus-visible:border-destructive"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant={"outline"}>Cancel</Button>
                    </DialogClose>
                    <Button variant={"destructive"} type="submit">
                      Delete my account
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Form>
          </Dialog>
        </ItemActions>
      </Item>
    </CardComponent>
  );
}
