import {
  RobloxCredential,
  RobloxCredentialInfo,
} from "../lib/types/roblox-credentials-types";
import { fetcher } from "../lib/utils/api-utils";

export const RobloxCredentialController = {
  link: (teamId: string, data: RobloxCredentialInfo) =>
    fetcher<RobloxCredential>(`/api/teams/${teamId}/roblox-credentials`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (teamId: string, credId: string) =>
    fetcher<RobloxCredential>(
      `/api/teams/${teamId}/roblox-credentials/${credId}`,
      { method: "DELETE" },
    ),

  rename: (teamId: string, credId: string, newName: string) =>
    fetcher<RobloxCredential>(
      `/api/teams/${teamId}/roblox-credentials/${credId}`,
      { method: "PATCH", body: JSON.stringify({ name: newName }) },
    ),

  rotate: (teamId: string, credId: string, newKey: string) =>
    fetcher<RobloxCredential>(
      `/api/teams/${teamId}/roblox-credentials/${credId}`,
      {
        method: "POST",
        body: JSON.stringify({ key: newKey }),
      },
    ),

  refresh: (teamId: string, credId: string) =>
    fetcher<RobloxCredential>(
      `/api/teams/${teamId}/roblox-credentials/${credId}/refresh`,
      { method: "POST" },
    ),

  list: (teamId: string) =>
    fetcher<RobloxCredential[]>(`/api/teams/${teamId}/roblox-credentials`),
};
