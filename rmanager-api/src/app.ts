import { Hono } from "hono";
import auth from "./routes/auth";
import org from "./routes/org";
import { ApiError } from "@rmanager/shared/lib/utils/api-utils";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

const trustedOrigins = process.env.TRUSTED_ORIGINS
  ? process.env.TRUSTED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:3001"];

const app = new Hono();
app.use(logger());
app.use(cors({ origin: trustedOrigins, credentials: true }));

app.route("/auth", auth);
app.route("/org", org);

app.onError((err, c) => {
  if (err instanceof ZodError)
    return c.json(
      { code: "InvalidFormat", message: "Invalid body format" },
      400,
    );
  if (err instanceof ApiError)
    return c.json(
      { code: err.message, message: err.clientMessage },
      err.status as ContentfulStatusCode,
    );
  return c.json(
    {
      code: "InternalServerError",
      message: "Unknown server error. Please try again later.",
    },
    500,
  );
});

export default app;
