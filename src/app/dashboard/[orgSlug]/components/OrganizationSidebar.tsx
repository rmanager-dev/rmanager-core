"use client";
import NavigationSidebar, { ItemGroup } from "@/src/components/NavigationSidebar";
import { useOrg } from "@/src/hooks/useOrg";
import { Box, Cable, Settings, User } from "lucide-react";

export default function OrganizationSidebar() {
  const { data, isLoading } = useOrg();

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
      ],
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
