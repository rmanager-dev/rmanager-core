"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import SendResetLink from "./SendResetLink";
import SetNewPassword from "./SetNewPassword";

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        toast.error("There was an error while loading reset password form");
        router.replace("/reset-password");
      }, 100);
    }
  }, [error, router]);

  if (token) {
    return <SetNewPassword token={token} />;
  } else {
    return <SendResetLink />;
  }
}
