import { afterAll, beforeEach, vi } from "vitest";
import { setupTestDb } from "./helpers/setup-db";
import { resetTestDb } from "./helpers/reset-db";

const { db } = await setupTestDb();

vi.mock("../db", () => ({
  db: db,
}));

beforeEach(async () => {
  await resetTestDb(db);
});

afterAll(async () => {
  await resetTestDb(db);
});
