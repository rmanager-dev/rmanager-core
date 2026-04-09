import { Project } from "../lib/types/project-types";
import { fetcher } from "../lib/utils/api-utils";

export const ProjectController = {
  list: (organizationId: string) =>
    fetcher<Project[]>(`/api/org/${organizationId}/projects`),

  resolve: (organizationId: string, slug: string) =>
    fetcher<Project>(
      `/api/org/${organizationId}/projects/resolve-slug/${slug}`,
    ),

  get: (organizationId: string, projectId: string) =>
    fetcher<Project>(`/api/org/${organizationId}/projects/${projectId}`),

  create: (organizationId: string, name: string) =>
    fetcher<Project>(`/api/org/${organizationId}/projects`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  rename: (organizationId: string, projectId: string, newName: string) =>
    fetcher<Project>(`/api/org/${organizationId}/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
    }),

  delete: (organizationId: string, projectId: string) =>
    fetcher<Project>(`/api/org/${organizationId}/projects/${projectId}`, {
      method: "DELETE",
    }),
};
