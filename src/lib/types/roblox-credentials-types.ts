import { roblox_credentials } from "@/src/db/schema/roblox_credentials";
import { InferDrizzleSelect } from "../utils";
import z from "zod";

export type RobloxCredentialStatus =
  typeof roblox_credentials.$inferSelect.status;

export const RobloxCredentialSelect = {
  id: roblox_credentials.id,
  organization_id: roblox_credentials.organizationId,
  status: roblox_credentials.status,
  errorMessage: roblox_credentials.errorMessage,
  name: roblox_credentials.name,
  expirationDate: roblox_credentials.expirationDate,
  keyOwnerRobloxId: roblox_credentials.keyOwnerRobloxId,
  createdAt: roblox_credentials.createdAt,
  lastUsed: roblox_credentials.lastUsed,
  lastRefreshedAt: roblox_credentials.lastRefreshedAt,
};
export type RobloxCredential = InferDrizzleSelect<
  typeof RobloxCredentialSelect
>;

export const RobloxCredentialInfo = {
  name: roblox_credentials.name,
  key: roblox_credentials.keyCiphertext,
};
export type RobloxCredentialInfo = InferDrizzleSelect<
  typeof RobloxCredentialInfo
>;
export const RobloxCredentialInfoSchema = z.object({
  name: z
    .string()
    .min(3, { error: "Name must be at least 3 characters" })
    .max(32, { error: "Name must be at most 32 characters" }),
  key: z
    .string()
    .min(1, { error: "Key must contain at least 1 character" })
    .max(2048, { error: "Key must be at most 2048 characters" }),
});

export const RobloxCredentialRenameSchema = z.object({
  name: z
    .string()
    .min(3, { error: "Name must be at least 3 characters" })
    .max(32, { error: "Name must be at most 32 characters" }),
});

export const RobloxCredentialRotateSchema = z.object({
  key: z
    .string()
    .min(1, { error: "Key must contain at least 1 character" })
    .max(2048, { error: "Key must be at most 2048 characters" }),
});

export const roblox_credential_status = {
  expires_soon: "This key expires in less than a week",
  expired: "This key has reached its expiration date",
  disabled: "This key is disabled in the Roblox Creator Dashboard",
  rate_limit: "Roblox is rate-limiting this key",
  roblox_down: "Roblox servers are currently unreachable",
};
