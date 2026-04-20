"server-only";

import { headers } from "next/headers";
import { baseFetcher } from "./api-utils";

export async function serverFetcher<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const baseUrl =
    process.env.SERVER_API_URL ?? process.env.NEXT_PUBLIC_API_URL!;
  const cookieHeader = (await headers()).get("cookie");

  return baseFetcher<T>(baseUrl, url, {
    ...options,
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...options?.headers,
    },
  });
}
