"use client";
import { useProject } from "@/src/hooks/useProject";

export default function Page() {
  const { data: project, isLoading } = useProject();

  if (isLoading) return null;

  return (
    <div>
      <p>Name: {project?.name}</p>
      <p>Slug: {project?.slug}</p>
    </div>
  );
}
