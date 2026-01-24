import { sql } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";

export async function resetTestDb(db: any) {
  await db.run(sql`PRAGMA foreign_keys = OFF`);

  const tables = await db.run(sql`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `);

  for (const table of tables.rows) {
    await db.run(sql.raw(`DELETE FROM "${table.name}"`));

    try {
      await db.run(
        sql.raw(`DELETE FROM sqlite_sequence WHERE name='${table.name}'`),
      );
    } catch (e) {}
  }

  await db.run(sql`PRAGMA foreign_keys = ON`);
}
