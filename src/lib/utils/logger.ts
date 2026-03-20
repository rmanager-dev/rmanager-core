type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  teamId?: string;
  actorId?: string;
  resourceId?: string;
  operation?: string;
  [key: string]: string | undefined;
}

function formatContext(context?: LogContext): string {
  if (!context) return "";
  const parts = Object.entries(context)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${v}`);
  return parts.length > 0 ? " | " + parts.join(" ") : "";
}

function log(
  level: LogLevel,
  service: string,
  message: string,
  error?: unknown,
  context?: LogContext,
): void {
  const timestamp = new Date().toISOString();
  const tag = `[${level.toUpperCase()}] [${service}]`;
  const ctx = formatContext(context);

  if (error !== undefined) {
    const name = error instanceof Error ? error.name : "UnknownError";
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`${timestamp} ${tag} ${message} | errorName=${name} errorMessage=${msg}${ctx}`);
  } else {
    console.log(`${timestamp} ${tag} ${message}${ctx}`);
  }
}

export function createLogger(service: string) {
  return {
    info(message: string, context?: LogContext) {
      log("info", service, message, undefined, context);
    },
    warn(message: string, context?: LogContext) {
      log("warn", service, message, undefined, context);
    },
    error(message: string, error?: unknown, context?: LogContext) {
      log("error", service, message, error, context);
    },
    debug(message: string, context?: LogContext) {
      log("debug", service, message, undefined, context);
    },
  };
}
