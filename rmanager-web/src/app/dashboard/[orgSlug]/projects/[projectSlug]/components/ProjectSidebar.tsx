"use client";
import NavigationSidebar, { ItemGroup } from "@/src/components/NavigationSidebar";
import { useOrg } from "@/src/hooks/useOrg";
import { useProject } from "@/src/hooks/useProject";
import { House, Settings } from "lucide-react";

export default function ProjectSidebar() {
  const { data: org, isLoading: isOrgLoading } = useOrg();
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
      url: `/dashboard/${org?.slug}/projects/${project?.slug}${item.url}`,
    })),
  }));
  return <NavigationSidebar items={dynamicItems} isLoading={isOrgLoading || isProjectLoading} />;
}
