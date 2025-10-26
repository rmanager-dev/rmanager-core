"use client";

import { redirect, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import VerifyEmailPage from "./VerifyEmailPage";

function AuthLogic() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  if (mode === "verifyEmail") {
    return <VerifyEmailPage />;
  } else {
    redirect("/home");
  }
}

function LoadingFallback() {
  return <div>Loading...</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthLogic />
    </Suspense>
  );
}
