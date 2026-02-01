import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/src/components/ui/item";
import { ChevronRight } from "lucide-react";

const DatabaseTypes = [
  {
    label: "S3 Compatible",
    description: "Compatible with S3 API",
    value: "S3",
  },
];

interface DatabaseTypeSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTypeSelect: (type: string) => void;
}

export default function DatabaseTypeSelectorDialog({
  open,
  onOpenChange,
  onTypeSelect,
}: DatabaseTypeSelectorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Database Type</DialogTitle>
          <DialogDescription>
            Choose the type of database you want to link.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {DatabaseTypes.map((databaseType) => (
            <Item
              variant={"outline"}
              size={"sm"}
              className="w-full"
              key={databaseType.value}
              asChild
            >
              <Button
                type="button"
                variant={"outline"}
                className="h-16"
                onClick={() => onTypeSelect(databaseType.value)}
              >
                <ItemContent>
                  <ItemTitle>{databaseType.label}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <ChevronRight className="size-4" />
                </ItemActions>
              </Button>
            </Item>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
