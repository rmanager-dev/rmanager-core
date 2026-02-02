import { Team, TeamMember, UserTeam } from "../lib/types/team-types";
import { ResponseToError } from "../lib/utils/errors";

export async function CreateTeam(name: string): Promise<UserTeam> {
  const response = await fetch("/api/teams", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw ResponseToError(responseData);
  }

  return responseData as UserTeam;
}

export async function DeleteTeam(teamId: string): Promise<Team> {
  const response = await fetch(`/api/teams/${teamId}`, { method: "DELETE" });

  const responseData = await response.json();
  if (!response.ok) {
    const error = ResponseToError(responseData);
    console.log(error);
    throw error;
  }

  return responseData as Team;
}

export async function ListTeams(): Promise<UserTeam[]> {
  const response = await fetch(`/api/teams`, { method: "GET" });

  const responseData = await response.json();
  if (!response.ok) {
    throw ResponseToError(responseData);
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
    throw ResponseToError(responseData);
  }

  return responseData as TeamMember;
}

export async function ResolveTeamBySlug(slug: string): Promise<UserTeam> {
  const response = await fetch(`/api/teams/resolve-slug/${slug}`);

  const responseData = await response.json();
  if (!response.ok) {
    throw ResponseToError(responseData);
  }
  return responseData as UserTeam;
}

export async function ChangeTeamName(
  teamId: string,
  newName: { name?: string; displayName?: string },
): Promise<Team> {
  const response = await fetch(`/api/teams/${teamId}`, {
    method: "PATCH",
    body: JSON.stringify(newName),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw ResponseToError(responseData);
  }

  return responseData as Team;
}

export async function ListTeamMembers(teamId: string): Promise<TeamMember[]> {
  const response = await fetch(`/api/teams/${teamId}/members`);

  const responseData = await response.json();
  if (!response.ok) {
    throw ResponseToError(responseData);
  }

  return responseData as TeamMember[];
}
