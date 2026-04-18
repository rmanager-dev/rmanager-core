import { and, eq } from "drizzle-orm";
import { db } from "@rmanager/shared/db";
import { database } from "@rmanager/shared/db/schema";
import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { DecryptString256, EncryptString256 } from "@rmanager/shared/lib/crypto/aes";
import { randomUUID } from "crypto";
import { AccessDenied, ApiError, DatabaseError } from "@rmanager/shared/lib/utils/api-utils";
import {
  Database,
  DatabaseSelect,
  DatabaseStatus,
  database_status,
} from "@rmanager/shared/lib/types/database-types";
import { createLogger } from "@rmanager/shared/lib/utils/logger";

const logger = createLogger("ExternalDatabaseService");

export interface DatabaseCredentials {
  AccessKeyID: string;
  SecretAccessKey: string;
  EndpointURL: string;
  Region: string;
  BucketName: string;
}

const InvalidS3Credentials = new ApiError(
  401,
  "InvalidS3Credentials",
  "Invalid S3 authentication credentials provided",
);

export const ExternalDatabaseService = {
  // Internal Methods
  async _setDbStatus(
    databaseId: string,
    info: { kind: DatabaseStatus; message?: string },
    tx?: any,
  ) {
    const client = tx ?? db;
    return await client
      .update(database)
      .set({
        status: info.kind,
        errorMessage: info.kind == "healthy" ? null : (info.message ?? null),
      })
      .where(eq(database.id, databaseId));
  },

  async _useDatabase<T>(
    databaseId: string,
    organizationId: string,
    callback: (
      creds: DatabaseCredentials,
      setStatus: (kind: DatabaseStatus, message?: string) => Promise<void>,
      tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    ) => T | Promise<T>,
  ): Promise<T> {
    return await db.transaction(async (tx) => {
      let dbInfo;
      try {
        dbInfo = await tx.query.database.findFirst({
          where: (db, { eq, and }) =>
            and(eq(db.id, databaseId), eq(db.organizationId, organizationId)),
        });
      } catch {
        throw DatabaseError;
      }

      if (!dbInfo) {
        throw AccessDenied;
      }

      let decryptedAk: string;
      let decryptedSk: string;
      try {
        decryptedAk = DecryptString256({
          encryptedData: dbInfo.akCiphertext,
          initializationVector: dbInfo.akIv,
          authTag: dbInfo.akTag,
        });
        decryptedSk = DecryptString256({
          encryptedData: dbInfo.skCiphertext,
          initializationVector: dbInfo.skIv,
          authTag: dbInfo.skTag,
        });
      } catch {
        throw new ApiError(
          500,
          "DATABASE_CRED_DECRYPTION_ERROR",
          "There was an error while accessing your database credentials. If the problem persists, please contact support.",
        );
      }

      const setStatus = async (kind: DatabaseStatus, message?: string) => {
        try {
          await this._setDbStatus(databaseId, { kind, message }, tx);
        } catch {
          throw DatabaseError;
        }
      };

      try {
        await tx
          .update(database)
          .set({ lastUsed: new Date() })
          .where(eq(database.id, databaseId));
      } catch {
        throw DatabaseError;
      }

      return await callback(
        {
          AccessKeyID: decryptedAk,
          SecretAccessKey: decryptedSk,
          EndpointURL: dbInfo.endpoint,
          Region: dbInfo.region,
          BucketName: dbInfo.bucketName,
        },
        setStatus,
        tx,
      );
    });
  },

  async _introspectDatabase(
    creds: DatabaseCredentials,
  ): Promise<{ status: DatabaseStatus; message?: string }> {
    const s3Client = new S3Client({
      region: creds.Region,
      endpoint: creds.EndpointURL,
      credentials: {
        accessKeyId: creds.AccessKeyID,
        secretAccessKey: creds.SecretAccessKey,
      },
      forcePathStyle: true,
    });

    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: creds.BucketName }));
      return { status: "healthy" };
    } catch (error: any) {
      const httpStatus = error.$metadata?.httpStatusCode;
      const errorName = error.name;

      if (
        errorName === "SlowDown" ||
        errorName === "ThrottlingException" ||
        httpStatus === 429
      ) {
        return { status: "warning", message: database_status.rate_limited };
      } else if (httpStatus === 503) {
        return { status: "warning", message: database_status.s3_down };
      } else if (
        httpStatus === 403 ||
        errorName === "AccessDenied" ||
        errorName === "Forbidden"
      ) {
        return {
          status: "error",
          message: database_status.invalid_credentials,
        };
      } else if (httpStatus === 404 || errorName === "NoSuchBucket") {
        return { status: "error", message: database_status.bucket_not_found };
      } else if (
        error.code === "ENOTFOUND" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ETIMEDOUT"
      ) {
        return {
          status: "error",
          message: database_status.endpoint_unreachable,
        };
      } else {
        return { status: "error", message: database_status.connection_failed };
      }
    }
  },

  async _applyIntrospectResults(
    databaseId: string,
    result: { status: DatabaseStatus; message?: string },
    tx?: any,
  ): Promise<Database> {
    const client = tx ?? db;
    try {
      const [updated] = await client
        .update(database)
        .set({
          status: result.status,
          errorMessage:
            result.status === "healthy" ? null : (result.message ?? null),
          lastRefreshedAt: new Date(),
        })
        .where(eq(database.id, databaseId))
        .returning(DatabaseSelect);
      return updated;
    } catch {
      throw DatabaseError;
    }
  },

  async CreateS3Client(Creds: DatabaseCredentials): Promise<S3Client> {
    const s3Client = new S3Client({
      region: Creds.Region,
      endpoint: Creds.EndpointURL,
      credentials: {
        accessKeyId: Creds.AccessKeyID,
        secretAccessKey: Creds.SecretAccessKey,
      },
      forcePathStyle: true,
    });

    const command = new HeadBucketCommand({ Bucket: Creds.BucketName });
    try {
      await s3Client.send(command); // Will throw an error if credentials are invalid
    } catch {
      throw InvalidS3Credentials;
    }
    return s3Client;
  },

  async LinkDatabase(
    actorId: string,
    organizationId: string,
    name: string,
    creds: DatabaseCredentials,
  ) {
    // Check if credentials are valid
    const introspectResult = await this._introspectDatabase(creds);
    if (introspectResult.status === "error") {
      throw new ApiError(
        400,
        "DATABASE_UNREACHABLE",
        introspectResult.message ?? database_status.connection_failed,
      );
    }

    // Encrypt sensitive data
    const encodedAkData = EncryptString256(creds.AccessKeyID);
    const encodedSkData = EncryptString256(creds.SecretAccessKey);

    // Append data to the database
    try {
      const [newRecord] = await db
        .insert(database)
        .values({
          id: randomUUID(),
          organizationId,
          createdBy: actorId,

          name,
          bucketName: creds.BucketName,
          endpoint: creds.EndpointURL,
          region: creds.Region,

          status: introspectResult.status,
          errorMessage: introspectResult.message ?? null,

          akCiphertext: encodedAkData.encryptedData,
          akIv: encodedAkData.initializationVector,
          akTag: encodedAkData.authTag,

          skCiphertext: encodedSkData.encryptedData,
          skIv: encodedSkData.initializationVector,
          skTag: encodedSkData.authTag,
        })
        .returning(DatabaseSelect);

      return newRecord;
    } catch (error) {
      logger.error("Database insertion failed", error, {
        organizationId,
        operation: "LinkDatabase",
      });
      throw DatabaseError;
    }
  },

  async ListDatabase(organizationId: string) {
    try {
      const results = await db
        .select(DatabaseSelect)
        .from(database)
        .where(eq(database.organizationId, organizationId));

      return results;
    } catch (error) {
      logger.error("Failed to fetch databases", error, {
        organizationId,
        operation: "ListDatabase",
      });
      throw DatabaseError;
    }
  },

  async DeleteDatabase(
    organizationId: string,
    databaseId: string,
  ): Promise<Database> {
    try {
      const [result] = await db
        .delete(database)
        .where(
          and(
            eq(database.id, databaseId),
            eq(database.organizationId, organizationId),
          ),
        )
        .returning(DatabaseSelect);
      if (!result) throw AccessDenied;
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("Failed to delete database", error, {
        resourceId: databaseId,
        operation: "DeleteDatabase",
      });
      throw DatabaseError;
    }
  },

  async RenameDatabase(
    organizationId: string,
    databaseId: string,
    newName: string,
  ) {
    try {
      const [result] = await db
        .update(database)
        .set({ name: newName })
        .where(
          and(
            eq(database.organizationId, organizationId),
            eq(database.id, databaseId),
          ),
        )
        .returning(DatabaseSelect);
      if (!result) throw AccessDenied;
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("Failed to rename database", error, {
        resourceId: databaseId,
        operation: "RenameDatabase",
      });
      throw DatabaseError;
    }
  },

  async RefreshDatabase(
    organizationId: string,
    databaseId: string,
  ): Promise<Database> {
    return await this._useDatabase(
      databaseId,
      organizationId,
      async (creds, _setStatus, tx) => {
        const updated = await this._applyIntrospectResults(
          databaseId,
          await this._introspectDatabase(creds),
          tx,
        );
        if (!updated) throw DatabaseError;
        return updated;
      },
    );
  },

  async RotateDatabaseCredentials(
    organizationId: string,
    databaseId: string,
    newCreds: Pick<DatabaseCredentials, "AccessKeyID" | "SecretAccessKey">,
  ): Promise<Database> {
    return await this._useDatabase(
      databaseId,
      organizationId,
      async (creds, _setStatus, tx) => {
        const fullCreds: DatabaseCredentials = {
          ...creds,
          AccessKeyID: newCreds.AccessKeyID,
          SecretAccessKey: newCreds.SecretAccessKey,
        };

        const introspectResult = await this._introspectDatabase(fullCreds);
        if (introspectResult.status === "error") {
          throw new ApiError(
            400,
            "DATABASE_UNREACHABLE",
            introspectResult.message ?? database_status.connection_failed,
          );
        }

        const encodedAkData = EncryptString256(newCreds.AccessKeyID);
        const encodedSkData = EncryptString256(newCreds.SecretAccessKey);

        try {
          const [updated] = await tx
            .update(database)
            .set({
              akCiphertext: encodedAkData.encryptedData,
              akIv: encodedAkData.initializationVector,
              akTag: encodedAkData.authTag,
              skCiphertext: encodedSkData.encryptedData,
              skIv: encodedSkData.initializationVector,
              skTag: encodedSkData.authTag,
            })
            .where(eq(database.id, databaseId))
            .returning(DatabaseSelect);
          if (!updated) throw AccessDenied;
          return await this._applyIntrospectResults(
            databaseId,
            introspectResult,
            tx,
          );
        } catch (error) {
          if (error instanceof ApiError) throw error;
          throw DatabaseError;
        }
      },
    );
  },
};
