"use client";
import { useSearchParams } from "next/navigation";
import DeleteSuccess from "./DeleteSuccess";
import TransferOwnership from "./TransferOwnership";
import { toast } from "sonner";
import { Suspense, useEffect, useState } from "react";
import { authClient } from "@/src/lib/auth-client";
import DeleteLoading from "./DeleteLoading";
import DeleteError from "./DeleteError";

function PageComponent() {
  const [status, setStatus] = useState<
    "loading" | "require-transfer" | "error" | "success"
  >("loading");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    setStatus("loading");
    if (!token) {
      toast.error("Invalid account deletion URL.");
      return;
    }
    authClient.deleteUser({ token }).then(({ error }) => {
      if (error) {
        if (error.code?.includes("CANNOT_DELETE_ACCOUNT_WHILE_OWNING_TEAMS")) {
          setStatus("require-transfer");
        } else {
          setStatus("error");
        }
      } else {
        setStatus("success");
      }
    });
  }, [token]);

  switch (status) {
    case "loading":
      return <DeleteLoading />;
    case "success":
      return <DeleteSuccess />;
    case "require-transfer":
      return <TransferOwnership />;
    case "error":
      return <DeleteError />;
  }
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageComponent />
    </Suspense>
  );
}
