import { twoFactorClient } from "better-auth/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
  ac,
  owner,
  admin,
  developer,
  viewer,
} from "@rmanager/shared/lib/permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  basePath: "/auth",
  fetchOptions: { credentials: "include" },
  plugins: [
    twoFactorClient(),
    organizationClient({
      ac,
      roles: { owner, admin, developer, viewer },
    }),
  ],
});
