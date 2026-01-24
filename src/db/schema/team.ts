import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./user";

export const team = sqliteTable("team", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),

  displayName: text("display_name").notNull(),
  name: text("name").notNull(),

  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),

  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});
