"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTeam } from "./useTeam";
import { Project } from "../lib/types/project-types";
import { ProjectController } from "../controllers/ProjectController";

export function useProject() {
  const { teamSlug, projectSlug } = useParams();
  const { data: team } = useTeam();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["project", team?.id, projectSlug],
    queryFn: () => ProjectController.resolve(team!.id, projectSlug as string),
    enabled: !!team?.id && !!projectSlug,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.isError) {
      router.push(`/dashboard/${teamSlug}`);
    }
  }, [query.isError, router, teamSlug]);

  return query;
}

export function useProjects() {
  const {
    data: team,
    isLoading: isLoadingTeam,
    isError: isErrorTeam,
  } = useTeam();

  const query = useQuery({
    queryKey: ["projects", team?.id],
    queryFn: () => ProjectController.list(team!.id),
    enabled: !!team?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isLoadingTeam || query.isLoading;
  const isError = isErrorTeam || query.isError;

  return {
    ...query,
    isLoading,
    isError,
  };
}

export function useProjectMutations() {
  const queryClient = useQueryClient();

  const createProject = useMutation({
    mutationFn: ({ teamId, name }: { teamId: string; name: string }) =>
      ProjectController.create(teamId, name),
    onSuccess: (project, variables) => {
      queryClient.setQueryData<Project[]>(
        ["projects", variables.teamId],
        (prevData) => {
          if (!prevData) return [project];
          return [...prevData, project];
        },
      );

      queryClient.setQueryData<Project>(
        ["project", variables.teamId, project.id],
        () => project,
      );
    },
  });

  const deleteProject = useMutation({
    mutationFn: ({
      teamId,
      projectId,
    }: {
      teamId: string;
      projectId: string;
    }) => ProjectController.delete(teamId, projectId),
    onSuccess: (oldProject, variables) => {
      queryClient.setQueryData<Project[]>(
        ["projects", variables.teamId],
        (prevData) => {
          if (!prevData) return prevData;
          return prevData.filter((p) => p.id !== oldProject.id);
        },
      );

      queryClient.removeQueries({
        queryKey: ["project", variables.teamId, oldProject.slug],
      });
    },
  });

  const renameProject = useMutation({
    mutationFn: ({
      teamId,
      projectId,
      newName,
    }: {
      teamId: string;
      projectId: string;
      newName: string;
    }) => ProjectController.rename(teamId, projectId, newName),
    onSuccess: (project, variables) => {
      queryClient.setQueryData<Project[]>(
        ["projects", variables.teamId],
        (prevData) => {
          if (!prevData) return [project];
          return prevData.map((p) => (p.id === project.id ? project : p));
        },
      );

      queryClient.setQueryData<Project>(
        ["project", variables.teamId, project.id],
        () => project,
      );
    },
  });

  return { createProject, deleteProject, renameProject };
}
