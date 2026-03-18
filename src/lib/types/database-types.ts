import { database } from "@/src/db/schema";
import { InferDrizzleSelect } from "../utils";
import z from "zod";

export type DatabaseStatus = typeof database.$inferSelect.status;

export const database_status = {
  connection_failed: "Could not connect to the S3 bucket",
  invalid_credentials: "Invalid credentials or insufficient bucket permissions",
  bucket_not_found: "The specified bucket does not exist or is not accessible",
  endpoint_unreachable: "The endpoint URL is unreachable",
  rate_limited: "The S3 endpoint is rate limiting requests",
  s3_down: "The S3 service or endpoint is currently unavailable",
};

export const DatabaseSelect = {
  id: database.id,
  teamId: database.teamId,

  status: database.status,
  errorMessage: database.errorMessage,

  name: database.name,
  endpoint: database.endpoint,
  region: database.region,
  type: database.type,

  createdBy: database.createdBy,
  createdAt: database.createdAt,
  lastUsed: database.lastUsed,
  lastRefreshedAt: database.lastRefreshedAt,
};
export type Database = InferDrizzleSelect<typeof DatabaseSelect>;

export const DatabaseRotateSchema = z.object({
  accessKey: z.string().min(1).max(256),
  secretKey: z.string().min(1).max(256),
});

export const DatabaseInfo = {
  type: database.type,
  name: database.name,
  endpoint: database.endpoint,
  region: database.region,
  bucketName: database.bucketName,
  accessKey: database.akCiphertext,
  secretKey: database.skCiphertext,
};
export type DatabaseInfo = InferDrizzleSelect<typeof DatabaseInfo>;
