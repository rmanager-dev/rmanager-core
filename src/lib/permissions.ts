import { defaultStatements } from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
  project: ["create", "delete", "rename"],
  database: ["create", "delete", "rename", "rotate", "refresh"],
  roblox_credential: ["create", "delete", "rename", "rotate", "refresh"],
};
export type Statement = typeof statement;
export type OrgPermissions = {
  [K in keyof Statement]?: Statement[K][number][];
};
