"use client";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/components/ui/empty";
import { Spinner } from "@/src/components/ui/spinner";
import { auth } from "@/src/lib/firebase/firebaseClient";
import { revokeSessionCookie } from "@/src/lib/utils/AuthUtils";
import { applyActionCode } from "firebase/auth";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  useEffect(() => {
    if (!oobCode) {
      redirect("/home");
    }

    applyActionCode(auth, oobCode)
      .then(() => {
        if (mode == "verifyAndChangeEmail" || mode == "recoverEmail") {
          auth.signOut();
        }
        toast.success("Successfully verified your email address!");
      })
      .catch((error) => {
        console.log(error);
        toast.error("There was an error while verifying your email address");
      })
      .finally(() => {
        router.replace("/dashboard");
      });
  }, [searchParams, router]);

  return (
    <div className="h-dvh flex flex-col justify-center items-center">
      <Empty className="max-w-xl">
        <EmptyHeader>
          <EmptyMedia variant={"icon"}>
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>Verifying email...</EmptyTitle>
          <EmptyDescription>
            Please wait while we are verifying your email. You will be
            redirected to the dashboard automatically.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
