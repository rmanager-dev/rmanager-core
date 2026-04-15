import { createAccessControl } from "better-auth/plugins/access";
import type { Role } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

export const statement = {
  ...defaultStatements,
  project: ["create", "delete", "rename"] as const,
  database: ["create", "delete", "rename", "rotate", "refresh"] as const,
  roblox_credential: [
    "create",
    "delete",
    "rename",
    "rotate",
    "refresh",
  ] as const,
};

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  project: ["create", "delete", "rename"],
  database: ["create", "delete", "rename", "rotate", "refresh"],
  roblox_credential: ["create", "delete", "rename", "rotate", "refresh"],
});

export const admin = ac.newRole({
  organization: ["update"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  project: ["create", "delete", "rename"],
  database: ["create", "delete", "rename", "rotate", "refresh"],
  roblox_credential: ["create", "delete", "rename", "rotate", "refresh"],
});

export const developer = ac.newRole({
  invitation: ["create"],
  project: ["create", "delete", "rename"],
  database: ["create", "delete", "rename", "rotate", "refresh"],
  roblox_credential: ["create", "delete", "rename", "rotate", "refresh"],
});

export const viewer = ac.newRole({}) as unknown as Role;

export type OrgPermissions = {
  [K in keyof typeof statement]?: (typeof statement)[K][number][];
};
