import { TeamMember } from "better-auth/plugins";
import { Team, UserTeam } from "../lib/types/team-types";

export async function CreateTeam(name: string): Promise<UserTeam> {
  const response = await fetch("/api/teams", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error);
  }

  return responseData as UserTeam;
}

export async function DeleteTeam(teamId: string): Promise<Team> {
  const response = await fetch(`/api/teams/${teamId}`, { method: "DELETE" });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error);
  }

  return responseData as Team;
}

export async function ListTeams(): Promise<UserTeam[]> {
  const response = await fetch(`/api/teams`, { method: "GET" });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error);
  }

  return responseData as UserTeam[];
}

export async function RemoveTeamMember({
  memberId,
  teamId,
}: {
  memberId: string;
  teamId: string;
}): Promise<TeamMember> {
  const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
    method: "DELETE",
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error);
  }

  return responseData as TeamMember;
}

export async function ResolveTeamBySlug(slug: string): Promise<UserTeam> {
  const response = await fetch(`/api/teams/resolve-slug/${slug}`);

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error);
  }
  return responseData as UserTeam;
}

export async function ChangeTeamName(
  teamId: string,
  newName: { name?: string; displayName: string },
): Promise<Team> {
  const response = await fetch(`/api/teams/${teamId}`, {
    method: "PATCH",
    body: JSON.stringify(newName),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw Error(responseData.error);
  }

  return responseData as Team;
}
