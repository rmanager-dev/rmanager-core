import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "@/src/db/schema/index";
import path from "path";

export async function setupTestDb() {
  const client = createClient({ url: `file:test.db` });
  const db = drizzle(client, { schema, casing: "snake_case" });

  return {
    db,
    client,
  };
}
