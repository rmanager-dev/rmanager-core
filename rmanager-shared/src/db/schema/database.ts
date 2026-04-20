import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";
import { organization } from "./organization";

export const database = pgTable("database", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),

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

  lastUsed: timestamp("last_used").defaultNow().notNull(),
  lastRefreshedAt: timestamp("last_refreshed_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
});
