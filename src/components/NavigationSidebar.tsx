"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar";
import { Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Skeleton } from "./ui/skeleton";

interface Item {
  title: string;
  Icon: typeof Settings;
  url: string;
}

export interface ItemGroup {
  groupTitle: string;
  items: Item[];
}

const SidebarItemComponent = ({
  item,
  pathname,
}: {
  item: Item;
  pathname?: string;
}) => {
  const isActive = pathname == item.url;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.url}>
          <item.Icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarGroupComponent = ({
  group,
  pathname,
  isLoading,
}: {
  group: ItemGroup;
  pathname: string;
  isLoading: boolean;
}) => {
  return (
    <SidebarGroup key={group.groupTitle}>
      <SidebarGroupLabel>{group.groupTitle}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => {
            if (isLoading) {
              return <Skeleton key={item.title} className="h-8 w-full my-1" />;
            }
            return (
              <SidebarItemComponent
                key={item.title}
                pathname={pathname}
                item={item}
              />
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

interface NavigationSidebarProps {
  items: ItemGroup[];
  isLoading: boolean;
}
export default function NavigationSidebar({
  items,
  isLoading,
}: NavigationSidebarProps) {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon" className="top-14">
      <SidebarContent>
        {items.map((group) => {
          return (
            <SidebarGroupComponent
              key={group.groupTitle}
              pathname={pathname}
              group={group}
              isLoading={isLoading}
            />
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
