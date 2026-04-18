"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Project } from "@rmanager/shared/lib/types/project-types";
import { ProjectController } from "@/src/controllers/ProjectController";
import { useOrg } from "./useOrg";

export function useProject() {
  const { orgSlug, projectSlug } = useParams();
  const { data: org } = useOrg();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["project", org?.id, projectSlug],
    queryFn: () => ProjectController.resolve(org!.id, projectSlug as string),
    enabled: !!org?.id && !!projectSlug,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.isError) {
      router.push(`/dashboard/${orgSlug}`);
    }
  }, [query.isError, router, orgSlug]);

  return query;
}

export function useProjects() {
  const { data: org, isLoading: isLoadingOrg, isError: isErrorOrg } = useOrg();

  const query = useQuery({
    queryKey: ["projects", org?.id],
    queryFn: () => ProjectController.list(org!.id),
    enabled: !!org?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isLoadingOrg || query.isLoading;
  const isError = isErrorOrg || query.isError;

  return {
    ...query,
    isLoading,
    isError,
  };
}

export function useProjectMutations() {
  const queryClient = useQueryClient();

  const createProject = useMutation({
    mutationFn: ({ orgId, name }: { orgId: string; name: string }) =>
      ProjectController.create(orgId, name),
    onSuccess: (project, variables) => {
      queryClient.setQueryData<Project[]>(
        ["projects", variables.orgId],
        (prevData) => {
          if (!prevData) return [project];
          return [...prevData, project];
        },
      );

      queryClient.setQueryData<Project>(
        ["project", variables.orgId, project.id],
        () => project,
      );
    },
  });

  const deleteProject = useMutation({
    mutationFn: ({ orgId, projectId }: { orgId: string; projectId: string }) =>
      ProjectController.delete(orgId, projectId),
    onSuccess: (oldProject, variables) => {
      queryClient.setQueryData<Project[]>(
        ["projects", variables.orgId],
        (prevData) => {
          if (!prevData) return prevData;
          return prevData.filter((p) => p.id !== oldProject.id);
        },
      );

      queryClient.removeQueries({
        queryKey: ["project", variables.orgId, oldProject.slug],
      });
    },
  });

  const renameProject = useMutation({
    mutationFn: ({
      orgId,
      projectId,
      newName,
    }: {
      orgId: string;
      projectId: string;
      newName: string;
    }) => ProjectController.rename(orgId, projectId, newName),
    onSuccess: (project, variables) => {
      queryClient.setQueryData<Project[]>(
        ["projects", variables.orgId],
        (prevData) => {
          if (!prevData) return [project];
          return prevData.map((p) => (p.id === project.id ? project : p));
        },
      );

      queryClient.setQueryData<Project>(
        ["project", variables.orgId, project.id],
        () => project,
      );
    },
  });

  return { createProject, deleteProject, renameProject };
}
