import { randomUUID } from "crypto";
import { db } from "../db";
import { roblox_credentials } from "../db/schema/roblox_credentials";
import { EncryptString256 } from "../lib/crypto/aes";
import {
  RobloxCredential,
  RobloxCredentialInfo,
  RobloxCredentialSelect,
} from "../lib/types/roblox-credentials-types";
import { AccessDenied, DatabaseError } from "../lib/utils/api-utils";
import { hasPermission } from "../lib/utils/team-utils";
import { TeamService } from "./TeamService";
import { and, eq } from "drizzle-orm";

export const RobloxCredentialsService = {
  async LinkRobloxCredential(
    actorId: string,
    teamId: string,
    creds: RobloxCredentialInfo,
  ): Promise<RobloxCredential> {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);

    if (!hasPermission(actorRole, "LinkRobloxCredential")) {
      throw AccessDenied;
    }

    const encodedKey = EncryptString256(creds.key);
    try {
      const [newRecord] = await db
        .insert(roblox_credentials)
        .values({
          id: randomUUID(),
          teamId,
          name: creds.name,
          keyCiphertext: encodedKey.encryptedData,
          keyIv: encodedKey.initializationVector,
          keyTag: encodedKey.authTag,
          createdBy: actorId,
        })
        .returning(RobloxCredentialSelect);

      return newRecord;
    } catch {
      throw DatabaseError;
    }
  },

  async DeleteRobloxCredential(
    actorId: string,
    teamId: string,
    credId: string,
  ): Promise<RobloxCredential> {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(actorRole, "DeleteRobloxCredential")) {
      throw AccessDenied;
    }

    try {
      const [result] = await db
        .delete(roblox_credentials)
        .where(
          and(
            eq(roblox_credentials.id, credId),
            eq(roblox_credentials.teamId, teamId),
          ),
        )
        .returning(RobloxCredentialSelect);
      if (!result) throw AccessDenied;
      return result;
    } catch {
      throw DatabaseError;
    }
  },

  async RenameRobloxCredential(
    actorId: string,
    teamId: string,
    credId: string,
    newName: string,
  ): Promise<RobloxCredential> {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(actorRole, "RenameRobloxCredential")) {
      throw AccessDenied;
    }

    try {
      const [result] = await db
        .update(roblox_credentials)
        .set({ name: newName })
        .where(
          and(
            eq(roblox_credentials.id, credId),
            eq(roblox_credentials.teamId, teamId),
          ),
        )
        .returning(RobloxCredentialSelect);
      if (!result) throw AccessDenied;
      return result;
    } catch {
      throw DatabaseError;
    }
  },

  async RotateRobloxCredential(
    actorId: string,
    teamId: string,
    credId: string,
    newKey: string,
  ): Promise<void> {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(actorRole, "RotateRobloxCredential")) {
      throw AccessDenied;
    }

    const newKeyEncrypted = EncryptString256(newKey);
    try {
      await db
        .update(roblox_credentials)
        .set({
          keyCiphertext: newKeyEncrypted.encryptedData,
          keyIv: newKeyEncrypted.initializationVector,
          keyTag: newKeyEncrypted.authTag,
        })
        .where(
          and(
            eq(roblox_credentials.id, credId),
            eq(roblox_credentials.teamId, teamId),
          ),
        )
        .returning(RobloxCredentialSelect);
    } catch {
      throw DatabaseError;
    }
  },

  async ListTeamRobloxCredentials(
    actorId: string,
    teamId: string,
  ): Promise<RobloxCredential[]> {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(actorRole, "RenameRobloxCredential")) {
      throw AccessDenied;
    }

    try {
      const results = await db
        .select(RobloxCredentialSelect)
        .from(roblox_credentials)
        .where(eq(roblox_credentials.teamId, teamId));
      return results;
    } catch {
      throw DatabaseError;
    }
  },
};
