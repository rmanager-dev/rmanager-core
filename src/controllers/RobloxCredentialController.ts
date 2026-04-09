import {
  RobloxCredential,
  RobloxCredentialInfo,
} from "../lib/types/roblox-credentials-types";
import { fetcher } from "../lib/utils/api-utils";

export const RobloxCredentialController = {
  link: (organizationId: string, data: RobloxCredentialInfo) =>
    fetcher<RobloxCredential>(`/api/org/${organizationId}/roblox-credentials`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (organizationId: string, credId: string) =>
    fetcher<RobloxCredential>(
      `/api/org/${organizationId}/roblox-credentials/${credId}`,
      { method: "DELETE" },
    ),

  rename: (organizationId: string, credId: string, newName: string) =>
    fetcher<RobloxCredential>(
      `/api/org/${organizationId}/roblox-credentials/${credId}`,
      { method: "PATCH", body: JSON.stringify({ name: newName }) },
    ),

  rotate: (organizationId: string, credId: string, newKey: string) =>
    fetcher<RobloxCredential>(
      `/api/org/${organizationId}/roblox-credentials/${credId}`,
      {
        method: "POST",
        body: JSON.stringify({ key: newKey }),
      },
    ),

  refresh: (organizationId: string, credId: string) =>
    fetcher<RobloxCredential>(
      `/api/org/${organizationId}/roblox-credentials/${credId}/refresh`,
      { method: "POST" },
    ),

  list: (organizationId: string) =>
    fetcher<RobloxCredential[]>(
      `/api/org/${organizationId}/roblox-credentials`,
    ),
};
