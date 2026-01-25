import { Team } from "../app/dashboard/components/TeamColumn";

export async function CreateTeam(name: string) {
  const response = await fetch("/api/teams", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error);
  }

  return responseData as Team;
}

export async function DeleteTeam(teamId: string) {
  const response = await fetch(`/api/teams/${teamId}`, { method: "DELETE" });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error);
  }
}

export async function ListTeams() {
  const response = await fetch(`/api/teams`, { method: "GET" });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error);
  }

  return responseData as Team[];
}
