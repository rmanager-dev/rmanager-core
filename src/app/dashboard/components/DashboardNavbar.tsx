"use client";
import Navbar from "@/src/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import UserDropdown from "@/src/components/Navbar/UserDropdown";
import { SidebarTrigger } from "@/src/components/ui/sidebar";
import { useTeam, useTeams } from "@/src/hooks/useTeam";
import { useProject, useProjects } from "@/src/hooks/useProject";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";
import { Box, Building2, Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { usePathname } from "next/navigation";

interface ItemDropdownProps<T> {
  label: string;
  items: T[] | undefined;
  activeItem: T | undefined;
  getLabel: (item: T) => string;
  getHref: (item: T) => string;
}
function ItemDropdown<T extends { id: string | number }>({
  label,
  items,
  activeItem,
  getLabel,
  getHref,
}: ItemDropdownProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} className="size-7 m-0">
          <ChevronsUpDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {items?.map((t) => (
            <DropdownMenuItem key={t.id} asChild>
              <Link href={getHref(t)} className={activeItem?.id == t.id ? "bg-accent" : ""}>
                {getLabel(t)}
                {t.id == activeItem?.id && <Check />}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardNavbar() {
  const pathname = usePathname();
  const { data: teams, isLoading: isTeamsLoading } = useTeams();
  const { data: team, isLoading: isTeamLoading } = useTeam();
  const { data: projects, isLoading: isProjectsLoading } = useProjects();
  const { data: project, isLoading: isProjectLoading } = useProject();

  const afterTeamPath = pathname.split(`/dashboard/${team?.slug}`)[1];
  const afterProjectPath = pathname.split(`/dashboard/${team?.slug}/projects/${project?.slug}`)[1];

  return (
    <Navbar className="h-14">
      <div className="w-full flex justify-between items-center px-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <SidebarTrigger className="md:hidden shrink-0" />
          <Breadcrumb className="flex-1 min-w-0 relative">
            <BreadcrumbList className="flex flex-nowrap items-center overflow-x-auto overflow-y-hidden no-scrollbar mr-3 mask-gradient">
              <BreadcrumbItem className="shrink-0">
                <Link href={"/dashboard"}>
                  <Image
                    src={"/brand/logo.svg"}
                    width={60}
                    height={60}
                    alt="Logo"
                    className="invert dark:invert-0"
                  />
                </Link>
              </BreadcrumbItem>
              {team && (
                <>
                  <div className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-2 duration-500">
                    <BreadcrumbSeparator />
                    <div className="flex gap-1 items-center">
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link
                            href={`/dashboard/${team.slug}`}
                            className="flex gap-1 items-center"
                          >
                            <Building2 className="max-h-4" />
                            <span className="truncate">{team.displayName}</span>
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <ItemDropdown
                        label="Switch Team"
                        items={teams}
                        activeItem={team}
                        getLabel={(t) => t.displayName}
                        getHref={(t) =>
                          project ? `/dashboard/${t.slug}` : `/dashboard/${t.slug}/${afterTeamPath}`
                        }
                      />
                    </div>
                  </div>
                </>
              )}
              {team && project && (
                <>
                  <div className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-2 duration-500">
                    <BreadcrumbSeparator />
                    <div className="flex gap-1 items-center">
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link
                            href={`/dashboard/${team.slug}/projects/${project.slug}`}
                            className="flex gap-1 items-center"
                          >
                            <Box className="max-h-4" />
                            <span className="truncate">{project.name}</span>
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <ItemDropdown
                        label="Switch Project"
                        items={projects}
                        activeItem={project}
                        getLabel={(p) => p.name}
                        getHref={(p) =>
                          `/dashboard/${team.slug}/projects/${p.slug}/${afterProjectPath}`
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </BreadcrumbList>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent max-h-5/6" />
          </Breadcrumb>
        </div>
        <UserDropdown triggerProps={{ className: "rounded-full" }} />
      </div>
    </Navbar>
  );
}
