import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { team } from "./team";
import { sql } from "drizzle-orm";
import { user } from "./user";

export const roblox_credentials = sqliteTable("roblox_credentials", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  name: text("name").notNull(),

  keyCiphertext: text("key_ciphertext").notNull(),
  keyIv: text("key_iv").notNull(),
  keyTag: text("key_tag").notNull(),

  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
});
