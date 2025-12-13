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
import { Database, Settings, ShieldUser } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Item {
  title: string;
  Icon: typeof Settings;
  url: string;
}

interface ItemGroup {
  groupTitle: string;
  items: Item[];
}

const userSettingsSidebarItems: ItemGroup[] = [
  {
    groupTitle: "User Settings",
    items: [
      {
        title: "Preferences",
        Icon: Settings,
        url: "/dashboard/user/preferences",
      },
      {
        title: "Security",
        Icon: ShieldUser,
        url: "/dashboard/user/security",
      },
    ],
  },
  {
    groupTitle: "Connections",
    items: [
      {
        title: "Databases",
        Icon: Database,
        url: "/dashboard/user/databases",
      },
    ],
  },
];

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
}: {
  group: ItemGroup;
  pathname: string;
}) => {
  return (
    <SidebarGroup key={group.groupTitle}>
      <SidebarGroupLabel>{group.groupTitle}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => {
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

export default function UserSettingsSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon" className="top-14">
      <SidebarContent>
        {userSettingsSidebarItems.map((group) => {
          return (
            <SidebarGroupComponent
              key={group.groupTitle}
              pathname={pathname}
              group={group}
            />
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
