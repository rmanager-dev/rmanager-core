import { Hono } from "hono";
import { requireOrgMember, requireOrgPermission } from "@/middleware/auth";
import { RobloxCredentialsService } from "@/services/RobloxCredentialsService";
import {
  RobloxCredentialInfoSchema,
  RobloxCredentialRenameSchema,
  RobloxCredentialRotateSchema,
} from "@rmanager/shared/lib/types/roblox-credentials-types";

const roblox_credentials = new Hono();

// List Credentials
roblox_credentials.get("/", requireOrgMember, async (c) => {
  const orgId = c.req.param("orgId")!;

  const credentials =
    await RobloxCredentialsService.ListOrganizationRobloxCredentials(orgId);
  return c.json(credentials);
});

// Create Credential
roblox_credentials.post(
  "/",
  requireOrgPermission({ roblox_credential: ["create"] }),
  async (c) => {
    const body = RobloxCredentialInfoSchema.parse(await c.req.json());
    const orgId = c.req.param("orgId")!;
    const session = c.var.session;

    const cred = await RobloxCredentialsService.LinkRobloxCredential(
      session.user.id,
      orgId,
      body,
    );
    return c.json(cred);
  },
);

// Delete Credential
roblox_credentials.delete(
  "/:credId",
  requireOrgPermission({ roblox_credential: ["delete"] }),
  async (c) => {
    const orgId = c.req.param("orgId")!;
    const credId = c.req.param("credId");

    const deletedCred = await RobloxCredentialsService.DeleteRobloxCredential(
      orgId,
      credId,
    );
    return c.json(deletedCred);
  },
);

// Rename Credential
roblox_credentials.patch(
  "/:credId",
  requireOrgPermission({ roblox_credential: ["rename"] }),
  async (c) => {
    const body = RobloxCredentialRenameSchema.parse(await c.req.json());
    const orgId = c.req.param("orgId")!;
    const credId = c.req.param("credId");

    const renamedCred = await RobloxCredentialsService.RenameRobloxCredential(
      orgId,
      credId,
      body.name,
    );
    return c.json(renamedCred);
  },
);

// Rotate Credential
roblox_credentials.post(
  "/:credId",
  requireOrgPermission({ roblox_credential: ["rotate"] }),
  async (c) => {
    const body = RobloxCredentialRotateSchema.parse(await c.req.json());
    const orgId = c.req.param("orgId")!;
    const credId = c.req.param("credId");

    const rotatedCred = await RobloxCredentialsService.RotateRobloxCredential(
      orgId,
      credId,
      body.key,
    );
    return c.json(rotatedCred);
  },
);

roblox_credentials.post(
  "/:credId/refresh",
  requireOrgPermission({ roblox_credential: ["refresh"] }),
  async (c) => {
    const orgId = c.req.param("orgId")!;
    const credId = c.req.param("credId");

    const refreshedCred =
      await RobloxCredentialsService.RefreshRobloxCredential(orgId, credId);
    return c.json(refreshedCred);
  },
);

export default roblox_credentials;
