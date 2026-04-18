import {
  RobloxCredential,
  RobloxCredentialInfo,
} from "@rmanager/shared/lib/types/roblox-credentials-types";
import { fetcher } from "@/src/lib/utils/api-utils";

export const RobloxCredentialController = {
  link: (organizationId: string, data: RobloxCredentialInfo) =>
    fetcher<RobloxCredential>(`/org/${organizationId}/roblox-credentials`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (organizationId: string, credId: string) =>
    fetcher<RobloxCredential>(
      `/org/${organizationId}/roblox-credentials/${credId}`,
      { method: "DELETE" },
    ),

  rename: (organizationId: string, credId: string, newName: string) =>
    fetcher<RobloxCredential>(
      `/org/${organizationId}/roblox-credentials/${credId}`,
      { method: "PATCH", body: JSON.stringify({ name: newName }) },
    ),

  rotate: (organizationId: string, credId: string, newKey: string) =>
    fetcher<RobloxCredential>(
      `/org/${organizationId}/roblox-credentials/${credId}`,
      {
        method: "POST",
        body: JSON.stringify({ key: newKey }),
      },
    ),

  refresh: (organizationId: string, credId: string) =>
    fetcher<RobloxCredential>(
      `/org/${organizationId}/roblox-credentials/${credId}/refresh`,
      { method: "POST" },
    ),

  list: (organizationId: string) =>
    fetcher<RobloxCredential[]>(`/org/${organizationId}/roblox-credentials`),
};
