import { database } from "@/src/db/schema";
import { InferDrizzleSelect } from "../utils";

export const DatabaseSelect = {
  id: database.id,
  teamId: database.teamId,
  createdBy: database.createdBy,
  name: database.name,
  endpoint: database.endpoint,
  region: database.region,
  type: database.type,
  createdAt: database.createdAt,
};
export type Database = InferDrizzleSelect<typeof DatabaseSelect>;

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
