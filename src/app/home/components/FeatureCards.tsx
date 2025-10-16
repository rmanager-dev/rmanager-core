import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

export default function FeatureCards() {
  return (
    <div className="w-full grid auto-rows-fr gap-2 xl:gap-4 md:grid-cols-2  max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
      <Card className="w-full md:col-span-2 hover:border-ring hover:bg-muted transition-all">
        <CardHeader>
          <CardTitle>🛠️ Game Configuration Bundler</CardTitle>
          <CardDescription>
            Bundle your game configuration—including title, description,
            thumbnail, badges, and much more—directly into your releases. Ship
            your code and configuration together to ensure smart and flawless
            deployments.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="w-full hover:border-ring hover:bg-muted transition-all duration-100">
        <CardHeader>
          <CardTitle>📦 Custom Environments</CardTitle>
          <CardDescription>
            Separate your releases into isolated environments—like dev, pbe, or
            production—to test your updates and get feedback before they hit
            production.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="w-full hover:border-ring hover:bg-muted transition-all">
        <CardHeader>
          <CardTitle>🕒 Task Scheduler</CardTitle>
          <CardDescription>
            Schedule luau tasks and releases with a 5 minute precision to
            deliver consistant updates across your games effortlessly.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="w-full hover:border-ring hover:bg-muted transition-all">
        <CardHeader>
          <CardTitle>🖥️ rManager CLI</CardTitle>
          <CardDescription>
            Integrate rManager inside of your CI/CD pipeline easily. Simply
            install rManager CLI using Foreman to get started!
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="w-full hover:border-ring hover:bg-muted transition-all">
        <CardHeader>
          <CardTitle>🔄️ Instant Rollbacks</CardTitle>
          <CardDescription>
            Your update didn't go as planned? A huge bug appeared out of
            nowhere? Don't worry, rManager lets you safely rollback your game to
            a previous version with a single click.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
