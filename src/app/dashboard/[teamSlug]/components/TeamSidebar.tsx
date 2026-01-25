"use client";
import NavigationSidebar, {
  ItemGroup,
} from "@/src/components/NavigationSidebar";
import { useTeam } from "@/src/hooks/useTeam";
import { Box, Settings, User } from "lucide-react";

const SidebarItems: ItemGroup[] = [
  {
    groupTitle: "Manage",
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
      {
        title: "Settings",
        Icon: Settings,
        url: "/settings",
      },
    ],
  },
];

export default function TeamSidebar() {
  const { data, isLoading } = useTeam();

  const dynamicItems = SidebarItems.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      url: `/dashboard/${data?.slug}${item.url}`,
    })),
  }));
  return <NavigationSidebar items={dynamicItems} isLoading={isLoading} />;
}
