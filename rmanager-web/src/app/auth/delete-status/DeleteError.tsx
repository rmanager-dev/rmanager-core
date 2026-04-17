import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/components/ui/empty";
import { CircleAlert } from "lucide-react";

export default function DeleteError() {
  return (
    <div className="min-h-dvh flex flex-col items-center">
      <Empty className="w-full p-10">
        <EmptyHeader>
          <EmptyMedia variant={"icon"}>
            <CircleAlert />
          </EmptyMedia>
          <EmptyTitle className="text-2xl">
            We couldn't delete your account
          </EmptyTitle>
          <EmptyDescription>
            An unexpected error occurred while processing your request. Please
            try again in a few minutes or contact our support team if the
            problem persists.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
