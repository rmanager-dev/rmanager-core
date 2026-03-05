import { randomUUID } from "crypto";
import { db } from "../db";
import { roblox_credentials } from "../db/schema/roblox_credentials";
import { DecryptString256, EncryptString256 } from "../lib/crypto/aes";
import {
  RobloxCredential,
  RobloxCredentialInfo,
  RobloxCredentialSelect,
  RobloxCredentialStatus,
} from "../lib/types/roblox-credentials-types";
import { AccessDenied, ApiError, DatabaseError } from "../lib/utils/api-utils";
import { hasPermission } from "../lib/utils/team-utils";
import { TeamService } from "./TeamService";
import { and, eq } from "drizzle-orm";

export const RobloxCredentialsService = {
  // Internal Methods
  async _introspectKey(key: string) {
    const response = await fetch(
      "https://apis.roblox.com/api-keys/v1/introspect",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        "ROBLOX_INTROSPECT_ERROR",
        data.message ??
          "There was an error while verifying your API key. Please try again later",
      );
    }

    return data;
  },

  async _setKeyStatus(
    credId: string,
    info: { kind: RobloxCredentialStatus; message?: string },
    tx?: any,
  ) {
    const client = tx ?? db;
    return await client
      .update(roblox_credentials)
      .set({
        status: info.kind,
        errorMessage: info.kind == "healthy" ? null : (info.message ?? null),
      })
      .where(eq(roblox_credentials.id, credId));
  },

  async _useCredential<T>(
    credId: string,
    callback: (
      key: string,
      setStatus: (
        kind: RobloxCredentialStatus,
        message?: string,
      ) => Promise<void>,
      tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    ) => T | Promise<T>,
  ): Promise<T> {
    return await db.transaction(async (tx) => {
      let keyInfo: typeof roblox_credentials.$inferSelect;
      try {
        [keyInfo] = await tx
          .select()
          .from(roblox_credentials)
          .where(eq(roblox_credentials.id, credId));
      } catch {
        throw DatabaseError;
      }

      if (!keyInfo) {
        throw AccessDenied;
      }

      let decryptedKey;
      try {
        decryptedKey = DecryptString256({
          encryptedData: keyInfo.keyCiphertext,
          initializationVector: keyInfo.keyIv,
          authTag: keyInfo.keyTag,
        });
      } catch {
        throw new ApiError(
          500,
          "ROBLOX_CRED_DECRYPTION_ERROR",
          "There was an error while accessing your Roblox API Key. If the problem persists, please contact support.",
        );
      }

      const setStatus = async (
        kind: RobloxCredentialStatus,
        message?: string,
      ) => {
        try {
          await this._setKeyStatus(credId, { kind, message: message }, tx);
        } catch {
          throw DatabaseError;
        }
      };

      try {
        await tx
          .update(roblox_credentials)
          .set({ lastUsed: new Date() })
          .where(eq(roblox_credentials.id, credId));
      } catch {
        throw DatabaseError;
      }

      return await callback(decryptedKey, setStatus, tx);
    });
  },

  async _applyIntrospectResults(
    credId: string,
    keyInfo: any,
    tx?: Parameters<Parameters<typeof db.transaction>[0]>[0],
  ) {
    let status: RobloxCredentialStatus = "healthy";
    let message: string | undefined = undefined;

    const client = tx ?? db;

    // Check if the credential is expiring soon (in less than a week)
    const expDate = new Date(keyInfo.expirationTimeUtc);
    const now = Date.now();
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const isExpiringSoon = expDate.getTime() - now < ONE_WEEK_MS;

    if (!keyInfo.enabled) {
      status = "error";
      message = "This key is disabled in the Roblox Creator Dashboard";
    } else if (keyInfo.expired) {
      status = "error";
      message = "This key has reached its expiration date";
    } else if (isExpiringSoon) {
      status = "warning";
      message = "This key expires in less than a week";
    }

    // Update the credential row with the new introspect data
    try {
      const [updated] = await client
        .update(roblox_credentials)
        .set({
          ...(keyInfo.expirationTimeUtc !== undefined
            ? { expirationDate: new Date(keyInfo.expirationTimeUtc) }
            : {}),
          lastRefreshedAt: new Date(),
          status,
          errorMessage: message ?? null,
          keyOwnerRobloxId: keyInfo.authorizedUserId,
        })
        .where(eq(roblox_credentials.id, credId))
        .returning(RobloxCredentialSelect);

      // Return immediately the updated credential
      return updated;
    } catch {
      throw DatabaseError;
    }
  },

  // API Methods
  async LinkRobloxCredential(
    actorId: string,
    teamId: string,
    creds: RobloxCredentialInfo,
  ): Promise<RobloxCredential> {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);

    if (!hasPermission(actorRole, "LinkRobloxCredential")) {
      throw AccessDenied;
    }

    let finalStatus: RobloxCredentialStatus = "healthy";
    let message;
    const keyInfo = await this._introspectKey(creds.key);

    if (!keyInfo.enabled) {
      finalStatus = "error";
      message = "This key is disabled in the Roblox Creator Dashboard";
    } else if (keyInfo.expired) {
      finalStatus = "error";
      message = "This key has reached it's expiration date";
    }

    const encodedKey = EncryptString256(creds.key);
    try {
      const [newRecord] = await db
        .insert(roblox_credentials)
        .values({
          id: randomUUID(),
          teamId,
          name: creds.name,
          status: finalStatus,
          errorMessage: message,
          keyCiphertext: encodedKey.encryptedData,
          keyIv: encodedKey.initializationVector,
          keyTag: encodedKey.authTag,
          expirationDate: keyInfo.expirationTimeUtc
            ? new Date(keyInfo.expirationTimeUtc)
            : null,
          keyOwnerRobloxId: keyInfo.authorizedUserId,
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
  ): Promise<RobloxCredential> {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(actorRole, "RotateRobloxCredential")) {
      throw AccessDenied;
    }

    const keyInfo = await this._introspectKey(newKey);
    if (!keyInfo.enabled) {
      throw new ApiError(
        400,
        "ROTATION_FAILED",
        "The new key is disabled. Please enable the key in the Roblox Creator Dashboard before rotating",
      );
    } else if (keyInfo.expired) {
      throw new ApiError(
        400,
        "ROTATION_FAILED",
        "The new key is expired. Please refresh it in the Roblox Creator Dashboard before rotating",
      );
    }

    const newKeyEncrypted = EncryptString256(newKey);
    return await db.transaction(async (tx) => {
      await tx
        .update(roblox_credentials)
        .set({
          keyCiphertext: newKeyEncrypted.encryptedData,
          keyIv: newKeyEncrypted.initializationVector,
          keyTag: newKeyEncrypted.authTag,
        })
        .where(eq(roblox_credentials.id, credId));

      return this._applyIntrospectResults(credId, keyInfo, tx);
    });
  },

  async ListTeamRobloxCredentials(
    actorId: string,
    teamId: string,
  ): Promise<RobloxCredential[]> {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(actorRole, "ListRobloxCredentials")) {
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

  async RefreshRobloxCredential(
    actorId: string,
    teamId: string,
    credId: string,
  ): Promise<RobloxCredential> {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(actorRole, "RefreshRobloxCredential")) {
      throw AccessDenied;
    }

    return await this._useCredential(credId, async (key, setStatus, tx) => {
      // Try to fetch the credential info using _introspectKey
      let keyInfo;
      try {
        keyInfo = await this._introspectKey(key);
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 429) {
            await setStatus("warning", "Roblox is rate-limiting this key");
          } else if (error.status >= 500) {
            await setStatus(
              "warning",
              "Roblox servers are currently unreachable",
            );
          } else {
            await setStatus("error", error.clientMessage);
          }
        } else {
          throw error;
        }
      }

      // Update credential row
      // Skip if _introspectKey rejected
      if (keyInfo) {
        try {
          const updatedCred = await this._applyIntrospectResults(
            credId,
            keyInfo,
            tx,
          );
          if (updatedCred) return updatedCred;
        } catch (error) {}
      }

      // Return the final credential info (fallback for when _introspectKey rejected)
      const result = await tx
        .select(RobloxCredentialSelect)
        .from(roblox_credentials)
        .where(eq(roblox_credentials.id, credId))
        .get();

      if (!result) throw DatabaseError;
      return result;
    });
  },
};
