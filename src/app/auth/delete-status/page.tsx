"use client";
import { useSearchParams } from "next/navigation";
import DeleteSuccess from "./DeleteSuccess";
import TransferOwnership from "./TransferOwnership";
import DeletePending from "./DeletePending";

export default function Page() {
  const searchParams = useSearchParams();

  const status = searchParams.get("status");
  const token = searchParams.get("token");

  if (token) {
    return <DeletePending />;
  } else if (status === "success") {
    return <DeleteSuccess />;
  } else if (status === "require-transfer") {
    return <TransferOwnership />;
  }
}
