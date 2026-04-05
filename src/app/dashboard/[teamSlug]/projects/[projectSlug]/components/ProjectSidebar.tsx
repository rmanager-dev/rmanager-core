"use client";
import NavigationSidebar, { ItemGroup } from "@/src/components/NavigationSidebar";
import { useProject } from "@/src/hooks/useProject";
import { useTeam } from "@/src/hooks/useTeam";
import { House, Settings } from "lucide-react";

export default function ProjectSidebar() {
  const { data: team, isLoading: isTeamLoading } = useTeam();
  const { data: project, isLoading: isProjectLoading } = useProject();

  const SidebarItems: ItemGroup[] = [
    {
      groupTitle: "Workspace",
      items: [
        {
          title: "Overview",
          Icon: House,
          url: "",
        },
      ],
    },
    {
      groupTitle: "Manage",
      items: [
        {
          title: "Project Settings",
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
      url: `/dashboard/${team?.slug}/projects/${project?.slug}${item.url}`,
    })),
  }));
  return <NavigationSidebar items={dynamicItems} isLoading={isTeamLoading || isProjectLoading} />;
}
