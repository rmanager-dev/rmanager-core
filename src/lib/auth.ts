import { db } from "@/src/db";
import * as schema from "@/src/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 256,
  },
  rateLimit: {
    enabled: true,
    max: 60,
    window: 60,
  },
});
