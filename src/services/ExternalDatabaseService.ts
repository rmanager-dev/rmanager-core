import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { database, user } from "../db/schema";
import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { EncryptString256 } from "../lib/crypto/aes";
import { randomUUID } from "crypto";
import { ApiError } from "../lib/utils/errors";

export interface DatabaseCredentials {
  AccessKeyID: string;
  SecretAccessKey: string;
  EndpointURL: string;
  Region: string;
  BucketName: string;
}

async function CheckUserExist(UserId: string): Promise<boolean> {
  const userProfile = await db.query.user.findFirst({
    where: eq(user.id, UserId),
    columns: { id: true },
  });
  return !!userProfile;
}

const UserNotFound = new ApiError(401, "UserNotFound", "Unauthorized");
const DatabaseError = new ApiError(
  502,
  "DatabaseError",
  "Couldn't reach database, please try again later.",
);
const AccessDenied = new ApiError(
  403,
  "AccessDenied",
  "You don't have access to this resource",
);
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

  async LinkDatabase(UserId: string, Name: string, Creds: DatabaseCredentials) {
    // Check if the user exists
    if (!(await CheckUserExist(UserId))) {
      throw UserNotFound;
    }

    // Check if credentials are valid
    try {
      await this.CreateS3Client(Creds); // Will throw an error if credentials are invalid
    } catch (error) {
      throw InvalidS3Credentials;
    }

    // Encrypt sensitive data
    const encodedAkData = EncryptString256(Creds.AccessKeyID);
    const encodedSkData = EncryptString256(Creds.SecretAccessKey);

    // Append data to the database
    try {
      const [newRecord] = await db
        .insert(database)
        .values({
          id: randomUUID(),
          userId: UserId,

          name: Name,
          bucketName: Creds.BucketName,
          endpoint: Creds.EndpointURL,
          region: Creds.Region,

          akCiphertext: encodedAkData.encryptedData,
          akIv: encodedAkData.initializationVector,
          akTag: encodedAkData.authTag,

          skCiphertext: encodedSkData.encryptedData,
          skIv: encodedSkData.initializationVector,
          skTag: encodedSkData.authTag,
        })
        .returning({
          id: database.id,
          name: database.name,
          endpoint: database.endpoint,
          region: database.region,
          type: database.type,
        });

      return newRecord;
    } catch (error) {
      console.error("Database insertion failed: ", error);
      throw DatabaseError;
    }
  },

  async ListDatabase(UserId: string) {
    // Check if the user exists
    if (!(await CheckUserExist(UserId))) {
      throw UserNotFound;
    }

    try {
      const results = await db
        .select({
          id: database.id,
          type: database.type,
          name: database.name,
          endpoint: database.endpoint,
          region: database.region,
        })
        .from(database)
        .where(eq(database.userId, UserId));

      return results;
    } catch (error) {
      console.error("Error while fetching user's databases: ", error);
      throw DatabaseError;
    }
  },

  async DeleteDatabase(UserId: string, DatabaseId: string) {
    // Check if the user exists
    if (!(await CheckUserExist(UserId))) {
      throw UserNotFound;
    }

    let rowsAffected = 0;
    try {
      const result = await db
        .delete(database)
        .where(and(eq(database.id, DatabaseId), eq(database.userId, UserId)));

      rowsAffected = result.rowsAffected;
    } catch (error) {
      console.error(`Failed to delete database ${DatabaseId}: `, error);
      throw DatabaseError;
    }

    if (rowsAffected == 0) {
      console.warn(
        `User attempted to delete a database they don't own: DB=${DatabaseId} User=${UserId}`,
      );
      throw AccessDenied;
    }
  },

  async RenameDatabase(UserId: string, DatabaseId: string, NewName: string) {
    // Check if the user exists
    if (!(await CheckUserExist(UserId))) {
      throw UserNotFound;
    }

    let result;
    try {
      result = await db
        .update(database)
        .set({ name: NewName })
        .where(and(eq(database.userId, UserId), eq(database.id, DatabaseId)))
        .returning({
          id: database.id,
          name: database.name,
          endpoint: database.endpoint,
          region: database.region,
          type: database.type,
        });
    } catch (error) {
      console.error(`Failed to rename database ${DatabaseId}: `, error);
      throw DatabaseError;
    }

    if (!result) {
      console.warn(
        `User attempted to rename a database they don't own: DB=${DatabaseId} User=${UserId}`,
      );
      throw AccessDenied;
    }

    return result;
  },
};
