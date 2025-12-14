import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./user";
import { sql } from "drizzle-orm";

export const database = sqliteTable("database", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  type: text("type", { enum: ["S3"] })
    .notNull()
    .default("S3"),
  name: text("name").notNull(),
  endpoint: text("endpoint").notNull(),
  region: text("region").notNull(),
  bucketName: text("bucket_name").notNull(),

  akCiphertext: text("ak_ciphertext").notNull(),
  akIv: text("ak_iv").notNull(),
  akTag: text("ak_tag").notNull(),

  skCiphertext: text("sk_ciphertext").notNull(),
  skIv: text("sk_iv").notNull(),
  skTag: text("sk_tag").notNull(),

  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});
