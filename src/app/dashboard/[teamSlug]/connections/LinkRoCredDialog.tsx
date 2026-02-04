import FormDialog from "@/src/components/FormDialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { useRobloxCredentialMutations } from "@/src/hooks/useRobloxCredential";
import { useTeam } from "@/src/hooks/useTeam";
import { RobloxCredentialInfoSchema } from "@/src/lib/types/roblox-credentials-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface LinkRobloxCredentialDialogProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
}
export default function LinkRobloxCredentialDialog({
  open,
  setIsOpen,
}: LinkRobloxCredentialDialogProps) {
  const { linkRobloxCredential } = useRobloxCredentialMutations();
  const { data: team } = useTeam();

  const form = useForm({
    resolver: zodResolver(RobloxCredentialInfoSchema),
    defaultValues: {
      name: "",
      key: "",
    },
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={setIsOpen}
      title="Link Roblox API Key"
      description="Provide a Roblox API key to be used in your projects"
      form={form}
      callback={({ name, key }) => {
        const id = toast.loading("Linking Roblox API key to your team...");
        linkRobloxCredential
          .mutateAsync({
            teamId: team!.id,
            data: { name, key },
          })
          .then(() => {
            toast.success("Successfully linked Roblox API key to your team!", {
              id,
            });
            setIsOpen(false);
          })
          .catch((error) => {
            if (error instanceof Error) {
              toast.error(error.message, { id });
            } else {
              toast.error(
                "An unknown error happened while linking Roblox API key to your team. Please try again later.",
                { id },
              );
            }
          });
      }}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="My Roblox Key" maxLength={32} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="key"
        render={({ field }) => (
          <FormItem>
            <FormLabel>API Key</FormLabel>
            <FormControl>
              <Input
                placeholder="API Key Credentials"
                maxLength={2048}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
}
