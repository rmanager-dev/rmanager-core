import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { organization } from "./organization";

export const roblox_credentials = pgTable("roblox_credentials", {
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

  expirationDate: timestamp("expiration_date"),
  lastUsed: timestamp("last_used").defaultNow().notNull(),
  lastRefreshedAt: timestamp("last_refreshed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
});
