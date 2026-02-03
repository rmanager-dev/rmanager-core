import { roblox_credentials } from "@/src/db/schema/roblox_credentials";
import { InferDrizzleSelect } from "../utils";

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
