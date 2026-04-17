import { Button } from "@/src/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/components/ui/empty";
import { BadgeCheck } from "lucide-react";
import Link from "next/link";

export default function DeleteSuccess() {
  return (
    <div className="min-h-dvh flex flex-col items-center">
      <Empty className="w-full p-10">
        <EmptyHeader>
          <EmptyMedia variant={"icon"}>
            <BadgeCheck />
          </EmptyMedia>
          <EmptyTitle className="text-2xl">
            Your account was successfully deleted
          </EmptyTitle>
          <EmptyDescription>
            All of your personal data was permanently deleted from our
            databases. If you have further questions about your data, please
            contact the support.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button className="w-3/4 h-12" variant={"outline"} asChild>
            <Link href={"/home"}>Back to the homepage</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
