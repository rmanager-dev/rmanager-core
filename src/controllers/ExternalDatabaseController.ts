import { Database } from "../app/dashboard/user/databases/DatabaseColumn";

export interface DatabaseInfo {
  type: "S3";
  name: string;
  endpoint: string;
  region: string;
  bucketName: string;
  accessKey: string;
  secretKey: string;
}

export async function LinkDatabase(data: DatabaseInfo): Promise<Database> {
  const response = await fetch("/api/users/databases", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error);
  }

  return responseData as Database;
}

export async function ListDatabases(): Promise<Database[]> {
  const response = await fetch("/api/users/databases", {
    method: "GET",
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error);
  }

  return responseData as Database[];
}

export async function DeleteDatabase(databaseId: string): Promise<void> {
  const response = await fetch(`/api/users/databases/${databaseId}`, {
    method: "DELETE",
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error);
  }
}

export async function RenameDatabase(databaseId: string, newName: string) {
  const response = await fetch(`/api/users/databases/${databaseId}`, {
    method: "PATCH",
    body: JSON.stringify({ name: newName }),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error);
  }

  return responseData as Database;
}
