import FormDialog from "@/src/components/FormDialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { useDatabaseMutations } from "@/src/hooks/useDatabase";
import { useTeam } from "@/src/hooks/useTeam";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface S3DatabaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function S3DatabaseDialog({
  open,
  onOpenChange,
}: S3DatabaseDialogProps) {
  const { createDatabase } = useDatabaseMutations();
  const { data: team } = useTeam();
  const S3CompatibleCredsSchema = z.object({
    name: z
      .string()
      .min(1, { error: "Name is required" })
      .max(64, { error: "Max name length exceeded" }),
    endpoint: z.url("Invalid URL").max(2048, "Max URL length exceeded"),
    region: z
      .string()
      .min(1, { error: "Region is required" })
      .max(50, { error: "Max region length exceeded" }),
    bucketName: z
      .string()
      .min(1, { error: "Bucket name is required" })
      .max(100, { error: "Max bucket name length exceeded" }),
    accessKey: z
      .string()
      .min(1, { error: "Access key is required" })
      .max(256, { error: "Max access key length exceeded" }),
    secretKey: z
      .string()
      .min(1, { error: "Secret key is required" })
      .max(256, { error: "Max secret key length exceeded" }),
  });

  const form = useForm({
    resolver: zodResolver(S3CompatibleCredsSchema),
    defaultValues: {
      name: "",
      endpoint: "",
      region: "",
      bucketName: "",
      accessKey: "",
      secretKey: "",
    },
  });

  const handleS3DatabaseLink = (
    creds: z.infer<typeof S3CompatibleCredsSchema>,
  ) => {
    const id = toast.loading("Linking database...");
    createDatabase
      .mutateAsync({ teamId: team!.id, data: { ...creds, type: "S3" } })
      .then(() => {
        toast.success("Successfully linked database!", { id });
      })
      .catch((error) => {
        if (error instanceof Error) {
          toast.error(error.message, { id });
        } else {
          toast.error(
            "An unknown error occured while linking your database. Please try again later.",
            { id },
          );
        }
      });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Link S3 compatible database"
      description="Provide the credentials to your S3 compatible database to link to your account"
      form={form}
      callback={handleS3DatabaseLink}
      submitButtonText="Link"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="My Database" maxLength={64} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex gap-2">
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <FormControl>
                <Input placeholder="eu-west-1" maxLength={50} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endpoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endpoint</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://s3-eu-west-1.amazonaws.com"
                  maxLength={2048}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="bucketName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bucket Name</FormLabel>
            <FormControl>
              <Input placeholder="my-s3-bucket" maxLength={100} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex gap-2">
        <FormField
          control={form.control}
          name="accessKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Key ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="my-access-key-id"
                  maxLength={256}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="secretKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secret Access Key</FormLabel>
              <FormControl>
                <Input
                  placeholder="my-secret-access-key"
                  maxLength={256}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormDialog>
  );
}
