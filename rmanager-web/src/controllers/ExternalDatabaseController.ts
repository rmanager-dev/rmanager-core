import {
  Database,
  DatabaseInfo,
} from "@rmanager/shared/lib/types/database-types";
import { fetcher } from "@/src/lib/utils/api-utils";

export const ExternalDatabaseController = {
  link: (organizationId: string, data: DatabaseInfo) =>
    fetcher<Database>(`/org/${organizationId}/databases`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: (organizationId: string) =>
    fetcher<Database[]>(`/org/${organizationId}/databases`),

  delete: (organizationId: string, databaseId: string) =>
    fetcher<Database>(`/org/${organizationId}/databases/${databaseId}`, {
      method: "DELETE",
    }),

  rename: (organizationId: string, databaseId: string, newName: string) =>
    fetcher<Database>(`/org/${organizationId}/databases/${databaseId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: newName }),
    }),

  rotate: (
    organizationId: string,
    databaseId: string,
    accessKey: string,
    secretKey: string,
  ) =>
    fetcher<Database>(`/org/${organizationId}/databases/${databaseId}`, {
      method: "POST",
      body: JSON.stringify({ accessKey, secretKey }),
    }),

  refresh: (organizationId: string, databaseId: string) =>
    fetcher<Database>(
      `/org/${organizationId}/databases/${databaseId}/refresh`,
      { method: "POST" },
    ),
};
