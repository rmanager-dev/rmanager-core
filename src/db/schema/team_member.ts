import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { team } from "./team";
import { user } from "./user";
import { sql } from "drizzle-orm";

export const team_member = sqliteTable(
  "team_members",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    teamId: text("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    role: text("role", {
      enum: ["owner", "admin", "developer", "viewer"],
    }).notNull(),

    joinedAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.teamId] })],
);
