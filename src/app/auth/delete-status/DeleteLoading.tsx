import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/components/ui/empty";
import { Spinner } from "@/src/components/ui/spinner";

export default function DeleteLoading() {
  return (
    <div className="min-h-dvh flex flex-col items-center">
      <Empty className="w-full p-10">
        <EmptyHeader>
          <EmptyMedia variant={"icon"}>
            <Spinner />
          </EmptyMedia>
          <EmptyTitle className="text-2xl">Deleting your account...</EmptyTitle>
          <EmptyDescription>
            We're processing your request and removing your data from our
            systems. This may take a few moments.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
