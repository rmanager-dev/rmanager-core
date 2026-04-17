import { Database, DatabaseInfo } from "../lib/types/database-types";
import { fetcher } from "../lib/utils/api-utils";

export const ExternalDatabaseController = {
  link: (organizationId: string, data: DatabaseInfo) =>
    fetcher<Database>(`/api/org/${organizationId}/databases`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: (organizationId: string) =>
    fetcher<Database[]>(`/api/org/${organizationId}/databases`),

  delete: (organizationId: string, databaseId: string) =>
    fetcher<Database>(`/api/org/${organizationId}/databases/${databaseId}`, {
      method: "DELETE",
    }),

  rename: (organizationId: string, databaseId: string, newName: string) =>
    fetcher<Database>(`/api/org/${organizationId}/databases/${databaseId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
    }),

  rotate: (
    organizationId: string,
    databaseId: string,
    accessKey: string,
    secretKey: string,
  ) =>
    fetcher<Database>(`/api/org/${organizationId}/databases/${databaseId}`, {
      method: "POST",
      body: JSON.stringify({ accessKey, secretKey }),
    }),

  refresh: (organizationId: string, databaseId: string) =>
    fetcher<Database>(
      `/api/org/${organizationId}/databases/${databaseId}/refresh`,
      { method: "POST" },
    ),
};
