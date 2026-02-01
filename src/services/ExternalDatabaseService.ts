import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { database } from "../db/schema";
import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { EncryptString256 } from "../lib/crypto/aes";
import { randomUUID } from "crypto";
import { AccessDenied, ApiError, DatabaseError } from "../lib/utils/errors";
import { Database, DatabaseSelect } from "../lib/types/database-types";
import { TeamService } from "./TeamService";
import { hasPermission } from "../lib/utils/team-utils";

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
    teamId: string,
    name: string,
    creds: DatabaseCredentials,
  ) {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(actorRole, "LinkDatabase")) {
      throw AccessDenied;
    }

    // Check if credentials are valid
    await this.CreateS3Client(creds); // Will throw an error if credentials are invalid

    // Encrypt sensitive data
    const encodedAkData = EncryptString256(creds.AccessKeyID);
    const encodedSkData = EncryptString256(creds.SecretAccessKey);

    // Append data to the database
    try {
      const [newRecord] = await db
        .insert(database)
        .values({
          id: randomUUID(),
          teamId,
          createdBy: actorId,

          name,
          bucketName: creds.BucketName,
          endpoint: creds.EndpointURL,
          region: creds.Region,

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
      console.error("Database insertion failed: ", error);
      throw DatabaseError;
    }
  },

  async ListDatabase(actorId: string, teamId: string) {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(actorRole, "ListDatabases")) {
      throw AccessDenied;
    }

    try {
      const results = await db
        .select(DatabaseSelect)
        .from(database)
        .where(eq(database.teamId, teamId));

      return results;
    } catch (error) {
      console.error("Error while fetching user's databases: ", error);
      throw DatabaseError;
    }
  },

  async DeleteDatabase(
    actorId: string,
    teamId: string,
    databaseId: string,
  ): Promise<Database> {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(actorRole, "DeleteDatabase")) {
      throw AccessDenied;
    }

    try {
      const [result] = await db
        .delete(database)
        .where(and(eq(database.id, databaseId), eq(database.teamId, teamId)))
        .returning(DatabaseSelect);
      if (!result) throw AccessDenied;
      return result;
    } catch (error) {
      console.error(`Failed to delete database ${databaseId}: `, error);
      throw DatabaseError;
    }
  },

  async RenameDatabase(
    actorId: string,
    teamId: string,
    databaseId: string,
    newName: string,
  ) {
    const actorRole = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(actorRole, "RenameDatabase")) {
      throw AccessDenied;
    }

    try {
      const [result] = await db
        .update(database)
        .set({ name: newName })
        .where(and(eq(database.teamId, teamId), eq(database.id, databaseId)))
        .returning(DatabaseSelect);
      if (!result) throw AccessDenied;
      return result;
    } catch (error) {
      console.error(`Failed to rename database ${databaseId}: `, error);
      throw DatabaseError;
    }
  },
};
