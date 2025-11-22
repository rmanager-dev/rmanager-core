import { Button } from "@/src/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/components/ui/item";
import { Skeleton } from "@/src/components/ui/skeleton";
import { authClient } from "@/src/lib/auth-client";
import { RotateCcwKey } from "lucide-react";
import React from "react";

const ItemComponent = ({ children }: React.PropsWithChildren) => {
  return (
    <Item variant={"outline"} className="w-full">
      <ItemMedia variant={"icon"}>
        <RotateCcwKey />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Backup Codes</ItemTitle>
        <ItemDescription>
          Security codes that you can use in case you lost access to your 2FA
          Authenticator App
        </ItemDescription>
      </ItemContent>
      <ItemActions>{children}</ItemActions>
    </Item>
  );
};

export default function BackupCodesItemSecurity() {
  const { data, isPending } = authClient.useSession();
  const user = data?.user;

  if (!user || isPending) {
    return (
      <ItemComponent>
        <Skeleton className="h-8 w-16" />
      </ItemComponent>
    );
  }

  return (
    <ItemComponent>
      <Button variant={"outline"} disabled={!user.twoFactorEnabled}>
        Regenerate
      </Button>
    </ItemComponent>
  );
}
