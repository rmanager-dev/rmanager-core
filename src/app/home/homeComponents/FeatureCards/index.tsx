import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

export default function HomepageFeatureCards() {
  return (
    <div className="grid w-full lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 max-w-5xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Custom Environments</CardTitle>
          <CardDescription>
            Create isolated environments (PBE, Dev, Production) and restrict
            their access
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Task Scheduler</CardTitle>
          <CardDescription>
            Schedule a task to be ran using Luau Execution API at a precise time
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Release Scheduler</CardTitle>
          <CardDescription>
            Schedule a release to be published at a precise time
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
