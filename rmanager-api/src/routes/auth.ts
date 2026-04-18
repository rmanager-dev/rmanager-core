import { Hono } from "hono";
import { auth as authConfig } from "@rmanager/shared/lib/auth";

const auth = new Hono();
auth.on(["GET", "POST"], "/*", (c) => authConfig.handler(c.req.raw));
export default auth;
