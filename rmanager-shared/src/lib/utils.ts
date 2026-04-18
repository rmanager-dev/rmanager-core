export type InferDrizzleSelect<T> = {
  [K in keyof T]: T[K] extends {
    _: { data: infer TData; notNull: infer TNotNull };
  }
    ? TNotNull extends true
      ? TData
      : TData | null
    : never;
};

export class BetterAuthError extends Error {
  status: number;
  code?: string;

  constructor(error: {
    message?: string;
    status: number;
    statusText: string;
    code?: string;
  }) {
    super(error.message ?? error.statusText);
    this.status = error.status;
    this.code = error.code;
  }
}

export function errorFromBetterAuth(error: unknown): BetterAuthError {
  return new BetterAuthError(error as never);
}

export function nameToSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .join("-");
}
