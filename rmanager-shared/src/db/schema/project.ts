import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { organization } from "./organization";

export const project = pgTable(
  "project",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.organizationId, t.slug)],
);
