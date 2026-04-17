import { Button } from "@/src/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/components/ui/empty";
import { UserCog } from "lucide-react";
import Link from "next/link";

export default function TransferOwnership() {
  return (
    <div className="min-h-dvh flex flex-col items-center">
      <Empty className="w-full p-10">
        <EmptyHeader>
          <EmptyMedia variant={"icon"}>
            <UserCog />
          </EmptyMedia>
          <EmptyTitle className="text-2xl">Transfer Organization Ownership</EmptyTitle>
          <EmptyDescription>
            You cannot delete your account while you are the owner of one or more organizations.
            Please assign a new owner or delete your owned organizations.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button className="w-3/4 h-12" variant={"outline"} asChild>
            <Link href={"/dashboard"}>Manage my organizations</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
