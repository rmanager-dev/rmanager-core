import { createMiddleware } from "hono/factory";
import { metrics } from "@opentelemetry/api";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { routePath } from "hono/route";

const logger = logs.getLogger("hono-api");
const meter = metrics.getMeter("hono-api");

const responseBytesCounter = meter.createCounter(
  "http.server.response.body.size",
  {
    description: "Total bytes sent in HTTP responses",
    unit: "By",
  },
);

export const collectTelemetry = createMiddleware(async (c, next) => {
  const start = performance.now();
  await next();
  const request_duration_ms = performance.now() - start;
  const route = routePath(c);
  const response_size = Buffer.byteLength(await c.res.clone().text(), "utf8");
  responseBytesCounter.add(response_size, {
    "http.route": route,
    "http.request.method": c.req.method,
    "http.response.status_code": String(c.res.status),
  });

  logger.emit({
    severityNumber: SeverityNumber.INFO,
    severityText: "INFO",
    body: `${c.req.method} ${c.req.path} ${c.res.status} ${request_duration_ms}ms`,
    attributes: {
      "http.request.method": c.req.method,
      "url.path": c.req.path,
      "http.response.status_code": String(c.res.status),
      duration: request_duration_ms / 1000,
    },
  });
});
