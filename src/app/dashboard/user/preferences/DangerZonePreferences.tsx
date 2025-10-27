import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/components/ui/item";
import { TriangleAlert } from "lucide-react";

export default function DangerZonePreferences() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>DANGER ZONE</CardTitle>
      </CardHeader>
      <CardContent>
        <Item
          variant={"outline"}
          className="border-destructive bg-destructive/5"
        >
          <ItemMedia variant={"icon"} className="border-none bg-destructive">
            <TriangleAlert className="stroke-destructive-foreground" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Delete account</ItemTitle>
            <ItemDescription>
              Your account will be instantly deleted with all of it's data. This
              action is irreversible. You will be prompted to enter your
              password before deletion.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant={"destructive"}>Delete my account</Button>
          </ItemActions>
        </Item>
      </CardContent>
    </Card>
  );
}
