import { database } from "../../db/schema";
import { InferDrizzleSelect } from "../utils";
import { isSafeEndpointUrl } from "../utils/url-utils";
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
  organization_id: database.organizationId,

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

export const DatabaseCreateSchema = z.object({
  name: z
    .string()
    .min(3, { error: "Name must be at least 3 characters" })
    .max(64, { error: "Max name length exceeded" }),
  endpoint: z
    .url("Invalid URL")
    .max(2048, "Max URL length exceeded")
    .refine(isSafeEndpointUrl, "Endpoint URL must be a public HTTPS address"),
  region: z
    .string()
    .min(2, { error: "Region is required" })
    .max(50, { error: "Max region length exceeded" }),
  bucketName: z
    .string()
    .min(3, { error: "Bucket name must be at least 3 characters" })
    .max(100, { error: "Max bucket name length exceeded" }),
  accessKey: z
    .string()
    .min(1, { error: "Access key is required" })
    .max(256, { error: "Max access key length exceeded" }),
  secretKey: z
    .string()
    .min(1, { error: "Secret key is required" })
    .max(256, { error: "Max secret key length exceeded" }),
});

export const DatabaseRenameSchema = z.object({
  name: z
    .string()
    .min(3, { error: "Name must be at least 3 characters" })
    .max(64, { error: "Max name length exceeded" }),
});

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
