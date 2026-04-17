import { randomUUID } from "crypto";
import { db } from "../db";
import { roblox_credentials } from "../db/schema/roblox_credentials";
import { DecryptString256, EncryptString256 } from "../lib/crypto/aes";
import {
  roblox_credential_status,
  RobloxCredential,
  RobloxCredentialInfo,
  RobloxCredentialSelect,
  RobloxCredentialStatus,
} from "../lib/types/roblox-credentials-types";
import { AccessDenied, ApiError, DatabaseError } from "../lib/utils/api-utils";
import { createLogger } from "../lib/utils/logger";
import { and, eq } from "drizzle-orm";

const logger = createLogger("RobloxCredentialsService");

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
    organizationId: string,
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
      let keyInfo;
      try {
        keyInfo = await db.query.roblox_credentials.findFirst({
          where: (cred, { eq, and }) =>
            and(eq(cred.id, credId), eq(cred.organizationId, organizationId)),
        });
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
      message = roblox_credential_status.disabled;
    } else if (keyInfo.expired) {
      status = "error";
      message = roblox_credential_status.expired;
    } else if (isExpiringSoon) {
      status = "warning";
      message = roblox_credential_status.expires_soon;
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
    organizationId: string,
    creds: RobloxCredentialInfo,
  ): Promise<RobloxCredential> {
    const encodedKey = EncryptString256(creds.key);
    try {
      const [newRecord] = await db
        .insert(roblox_credentials)
        .values({
          id: randomUUID(),
          organizationId,
          name: creds.name,
          status: "error",
          keyCiphertext: encodedKey.encryptedData,
          keyIv: encodedKey.initializationVector,
          keyTag: encodedKey.authTag,
          keyOwnerRobloxId: 0,
          createdBy: actorId,
        })
        .returning({ id: roblox_credentials.id });

      return await this.RefreshRobloxCredential(organizationId, newRecord.id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw DatabaseError;
    }
  },

  async DeleteRobloxCredential(
    organizationId: string,
    credId: string,
  ): Promise<RobloxCredential> {
    try {
      const [result] = await db
        .delete(roblox_credentials)
        .where(
          and(
            eq(roblox_credentials.id, credId),
            eq(roblox_credentials.organizationId, organizationId),
          ),
        )
        .returning(RobloxCredentialSelect);
      if (!result) throw AccessDenied;
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw DatabaseError;
    }
  },

  async RenameRobloxCredential(
    organizationId: string,
    credId: string,
    newName: string,
  ): Promise<RobloxCredential> {
    try {
      const [result] = await db
        .update(roblox_credentials)
        .set({ name: newName })
        .where(
          and(
            eq(roblox_credentials.id, credId),
            eq(roblox_credentials.organizationId, organizationId),
          ),
        )
        .returning(RobloxCredentialSelect);
      if (!result) throw AccessDenied;
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw DatabaseError;
    }
  },

  async RotateRobloxCredential(
    orgId: string,
    credId: string,
    newKey: string,
  ): Promise<RobloxCredential> {
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
      const [cred] = await tx
        .update(roblox_credentials)
        .set({
          keyCiphertext: newKeyEncrypted.encryptedData,
          keyIv: newKeyEncrypted.initializationVector,
          keyTag: newKeyEncrypted.authTag,
        })
        .where(
          and(
            eq(roblox_credentials.id, credId),
            eq(roblox_credentials.organizationId, orgId),
          ),
        )
        .returning({ id: roblox_credentials.id });
      if (!cred) throw AccessDenied;
      return this._applyIntrospectResults(credId, keyInfo, tx);
    });
  },

  async ListOrganizationRobloxCredentials(
    organizationId: string,
  ): Promise<RobloxCredential[]> {
    try {
      const results = await db
        .select(RobloxCredentialSelect)
        .from(roblox_credentials)
        .where(eq(roblox_credentials.organizationId, organizationId));
      return results;
    } catch {
      throw DatabaseError;
    }
  },

  async RefreshRobloxCredential(
    organizationId: string,
    credId: string,
  ): Promise<RobloxCredential> {
    return await this._useCredential(
      credId,
      organizationId,
      async (key, setStatus, tx) => {
        // Try to fetch the credential info using _introspectKey
        let keyInfo;
        try {
          keyInfo = await this._introspectKey(key);
        } catch (error) {
          if (error instanceof ApiError) {
            if (error.status === 429) {
              await setStatus("warning", roblox_credential_status.rate_limit);
            } else if (error.status >= 500) {
              await setStatus("warning", roblox_credential_status.roblox_down);
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
          } catch (error) {
            logger.error("Failed to apply introspect results", error, {
              resourceId: credId,
            });
          }
        }

        // Return the final credential info (fallback for when _introspectKey rejected)
        const result = await tx
          .select(RobloxCredentialSelect)
          .from(roblox_credentials)
          .where(eq(roblox_credentials.id, credId))
          .get();

        if (!result) throw DatabaseError;
        return result;
      },
    );
  },
};
