import { Project } from "../lib/types/project-types";
import { fetcher } from "../lib/utils/api-utils";

export const ProjectController = {
  list: (teamId: string) =>
    fetcher<Project[]>(`/api/teams/${teamId}/projects`),

  resolve: (teamId: string, slug: string) =>
    fetcher<Project>(`/api/teams/${teamId}/projects/resolve-slug/${slug}`),

  get: (teamId: string, projectId: string) =>
    fetcher<Project>(`/api/teams/${teamId}/projects/${projectId}`),

  create: (teamId: string, name: string) =>
    fetcher<Project>(`/api/teams/${teamId}/projects`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  rename: (teamId: string, projectId: string, newName: string) =>
    fetcher<Project>(`/api/teams/${teamId}/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
    }),

  delete: (teamId: string, projectId: string) =>
    fetcher<Project>(`/api/teams/${teamId}/projects/${projectId}`, {
      method: "DELETE",
    }),
};
