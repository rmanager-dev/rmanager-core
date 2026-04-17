"use client";
import LocalTime from "@/src/components/LocalTime";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Project } from "@rmanager/shared/lib/types/project-types";
import { ColumnDef } from "@tanstack/react-table";
import { Copy, MoreHorizontal } from "lucide-react";

const ProjectActions = ({ project }: { project: Project }) => {
  return (
    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(project.id)}>
            <Copy />
            <span>Copy Project ID</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const projectColumns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: "Project",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => {
      const date = new Date(getValue<string>());
      return <LocalTime time={date} mode="absolute" />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ProjectActions project={row.original} />,
  },
];
