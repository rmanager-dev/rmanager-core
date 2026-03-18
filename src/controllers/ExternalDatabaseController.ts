import { Database, DatabaseInfo } from "../lib/types/database-types";
import { fetcher } from "../lib/utils/api-utils";

export const ExternalDatabaseController = {
  link: (teamId: string, data: DatabaseInfo) =>
    fetcher<Database>(`/api/teams/${teamId}/databases`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: (teamId: string) =>
    fetcher<Database[]>(`/api/teams/${teamId}/databases`),

  delete: (teamId: string, databaseId: string) =>
    fetcher<Database>(`/api/teams/${teamId}/databases/${databaseId}`, {
      method: "DELETE",
    }),

  rename: (teamId: string, databaseId: string, newName: string) =>
    fetcher<Database>(`/api/teams/${teamId}/databases/${databaseId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
    }),

  rotate: (
    teamId: string,
    databaseId: string,
    accessKey: string,
    secretKey: string,
  ) =>
    fetcher<Database>(`/api/teams/${teamId}/databases/${databaseId}`, {
      method: "POST",
      body: JSON.stringify({ accessKey, secretKey }),
    }),

  refresh: (teamId: string, databaseId: string) =>
    fetcher<Database>(
      `/api/teams/${teamId}/databases/${databaseId}/refresh`,
      { method: "POST" },
    ),
};
