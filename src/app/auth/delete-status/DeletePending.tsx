import { Button } from "@/src/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/components/ui/empty";
import { authClient } from "@/src/lib/auth-client";
import { Eraser } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function DeletePending() {
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const handleAccountDeletion = async () => {
    setIsLoading(true);

    if (!token) {
      toast.error("Invalid account deletion URL.");
      return;
    }

    const { error } = await authClient.deleteUser({
      token,
    });

    if (error) {
      if (error.code?.includes("CANNOT_DELETE_ACCOUNT_WHILE_OWNING_TEAMS")) {
        router.replace("/auth/delete-status?status=require-transfer");
      }
      toast.error(error.message);
    } else {
      router.replace("/auth/delete-status?status=success");
    }
    setIsLoading(false);
  };
  return (
    <div className="min-h-dvh flex flex-col items-center">
      <Empty className="w-full p-10">
        <EmptyHeader>
          <EmptyMedia variant={"icon"}>
            <Eraser />
          </EmptyMedia>
          <EmptyTitle className="text-2xl">
            Are you sure you want to delete your account?
          </EmptyTitle>
          <EmptyDescription>
            Your data will be permanently deleted from our databases and you
            will not be able to recover. This action in irreversible.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            className="w-3/4 h-12"
            variant={"destructive"}
            onClick={handleAccountDeletion}
            disabled={isLoading}
          >
            Delete my account
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
