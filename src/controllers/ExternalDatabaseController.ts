import { Database, DatabaseInfo } from "../lib/types/database-types";
import { ResponseToError } from "../lib/utils/errors";

export async function LinkDatabase(
  teamId: string,
  data: DatabaseInfo,
): Promise<Database> {
  const response = await fetch(`/api/teams/${teamId}/databases`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  if (!response.ok) {
    console.log(responseData);
    throw ResponseToError(responseData);
  }

  return responseData as Database;
}

export async function ListDatabases(teamId: string): Promise<Database[]> {
  const response = await fetch(`/api/teams/${teamId}/databases`, {
    method: "GET",
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw ResponseToError(responseData);
  }

  return responseData as Database[];
}

export async function DeleteDatabase(
  teamId: string,
  databaseId: string,
): Promise<Database> {
  const response = await fetch(`/api/teams/${teamId}/databases/${databaseId}`, {
    method: "DELETE",
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw ResponseToError(responseData);
  }

  return responseData as Database;
}

export async function RenameDatabase(
  teamId: string,
  databaseId: string,
  newName: string,
): Promise<Database> {
  const response = await fetch(`/api/teams/${teamId}/databases/${databaseId}`, {
    method: "PATCH",
    body: JSON.stringify({ name: newName }),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw ResponseToError(responseData);
  }

  return responseData as Database;
}
