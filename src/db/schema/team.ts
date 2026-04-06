import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./user";

export const team = sqliteTable("team", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),

  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});
