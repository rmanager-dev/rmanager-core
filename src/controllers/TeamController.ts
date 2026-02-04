import { Team, TeamMember, UserTeam } from "../lib/types/team-types";
import { fetcher } from "../lib/utils/api-utils";

export const TeamController = {
  create: (name: string) =>
    fetcher<UserTeam>("/api/teams", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  delete: (teamId: string) =>
    fetcher<Team>(`/api/teams/${teamId}`, { method: "DELETE" }),

  list: () => fetcher<UserTeam[]>("/api/teams"),

  resolve: (slug: string) =>
    fetcher<UserTeam>(`/api/teams/resolve-slug/${slug}`),

  changeName: (
    teamId: string,
    newName: { name?: string; displayName?: string },
  ) =>
    fetcher<Team>(`/api/teams/${teamId}`, {
      method: "PATCH",
      body: JSON.stringify(newName),
    }),

  removeMember: (teamId: string, memberId: string) =>
    fetcher<TeamMember>(`/api/teams/${teamId}/members/${memberId}`, {
      method: "DELETE",
    }),
  listMembers: (teamId: string) =>
    fetcher<TeamMember[]>(`/api/teams/${teamId}/members`),
};
