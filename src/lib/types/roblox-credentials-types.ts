import { roblox_credentials } from "@/src/db/schema/roblox_credentials";
import { InferDrizzleSelect } from "../utils";
import z from "zod";

export const RobloxCredentialSelect = {
  id: roblox_credentials.id,
  teamId: roblox_credentials.teamId,
  name: roblox_credentials.name,
  createdAt: roblox_credentials.createdAt,
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
