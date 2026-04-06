"use client";
import NavigationSidebar, { ItemGroup } from "@/src/components/NavigationSidebar";
import { useTeam } from "@/src/hooks/useTeam";
import { hasPermission } from "@/src/lib/utils/team-utils";
import { Box, Cable, Settings, User } from "lucide-react";

export default function TeamSidebar() {
  const { data, isLoading } = useTeam();

  const SidebarItems: ItemGroup[] = [
    {
      groupTitle: "Workspace",
      items: [
        {
          title: "Projects",
          Icon: Box,
          url: "",
        },
        {
          title: "Members",
          Icon: User,
          url: "/members",
        },
      ],
    },
    {
      groupTitle: "Manage",
      items: [
        {
          title: "Connections",
          Icon: Cable,
          url: "/connections",
        },
        {
          title: "Settings",
          Icon: Settings,
          url: "/settings",
        },
      ].filter((item) => {
        if (item.title === "Connections") {
          return (
            hasPermission(data?.role, "ListDatabases") ||
            hasPermission(data?.role, "ListRobloxCredentials")
          );
        }
        return true;
      }),
    },
  ];

  const dynamicItems = SidebarItems.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      url: `/dashboard/${data?.slug}${item.url}`,
    })),
  }));
  return <NavigationSidebar items={dynamicItems} isLoading={isLoading} />;
}
