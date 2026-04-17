import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { user } from "./user";
import { organization } from "./organization";

export const roblox_credentials = sqliteTable("roblox_credentials", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),

  status: text("status", { enum: ["healthy", "warning", "error"] })
    .notNull()
    .default("healthy"),
  errorMessage: text("error_message"),

  keyCiphertext: text("key_ciphertext").notNull(),
  keyIv: text("key_iv").notNull(),
  keyTag: text("key_tag").notNull(),

  keyOwnerRobloxId: integer("key_owner_roblox_id").notNull(),

  expirationDate: integer("expiration_date", {
    mode: "timestamp_ms",
  }),
  lastUsed: integer("last_used", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  lastRefreshedAt: integer("last_refreshed_at", {
    mode: "timestamp_ms",
  })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
});
