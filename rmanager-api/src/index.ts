import { serve } from "@hono/node-server";
import app from "./app";

serve({ fetch: app.fetch, port: Number(process.env.PORT) ?? 3001 });
console.log(`[HONO]: API ready on port ${process.env.PORT ?? 3001}`);
