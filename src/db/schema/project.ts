import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { team } from "./team";

export const project = sqliteTable(
  "project",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),

    teamId: text("teamId")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (t) => [unique().on(t.teamId, t.slug)],
);
