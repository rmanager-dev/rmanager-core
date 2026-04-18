import { NextResponse } from "next/server";
import { createLogger } from "@rmanager/shared/lib/utils/logger";
import {
  ApiError,
  ErrorResponse,
  ResponseToError,
} from "@rmanager/shared/lib/utils/api-utils";

export {
  UserNotFound,
  DatabaseError,
  AccessDenied,
  AuthenticationRequired,
} from "@rmanager/shared/lib/utils/api-utils";

const logger = createLogger("api-utils");

export function ErrorToNextResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json<ErrorResponse>(
      { code: error.message, message: error.clientMessage },
      { status: error.status },
    );
  }

  logger.error("Unhandled server error", error);
  return NextResponse.json(
    { error: "Unknown server error. Please try again later." },
    { status: 500 },
  );
}

export async function fetcher<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`,
    { credentials: "include", ...options },
  );
  const data = await response.json();

  if (!response.ok) {
    throw ResponseToError(data);
  }

  return data as T;
}
