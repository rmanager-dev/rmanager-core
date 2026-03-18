import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./user";
import { sql } from "drizzle-orm";
import { team } from "./team";

export const database = sqliteTable("database", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),

  status: text("status", { enum: ["healthy", "warning", "error"] })
    .notNull()
    .default("healthy"),
  errorMessage: text("error_message"),

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

  lastUsed: integer("last_used", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  lastRefreshedAt: integer("last_refreshed_at", {
    mode: "timestamp_ms",
  })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),

  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
});
