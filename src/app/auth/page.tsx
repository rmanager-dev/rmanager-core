"use client";
import { redirect, useSearchParams } from "next/navigation";
import VerifyEmailPage from "./VerifyEmailPage";

export default function Page() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  if (mode == "verifyEmail") {
    return VerifyEmailPage();
  } else {
    redirect("/home");
  }
}
