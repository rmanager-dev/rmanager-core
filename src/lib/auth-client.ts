import { twoFactorClient } from "better-auth/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, owner, admin, developer, viewer } from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient(),
    organizationClient({
      ac,
      roles: { owner, admin, developer, viewer },
    }),
  ],
});
