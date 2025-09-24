import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { adminAuth } from "../lib/firebase/firebaseAdmin";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

// Rules //
const ruleCallbacks: Map<
  string,
  (cookieStore: ReadonlyRequestCookies) => RuleResult
> = new Map();

ruleCallbacks.set("requireLoggedIn", async (cookieStore) => {
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { success: false };
  }

  const idToken = await adminAuth
    .verifySessionCookie(sessionCookie, true)
    .catch(() => {
      return undefined;
    });

  if (idToken) {
    return { success: true };
  } else {
    return { success: false };
  }
});

ruleCallbacks.set("requireLoggedOff", async (cookieStore) => {
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    return { success: true };
  }

  const idToken = await adminAuth
    .verifySessionCookie(sessionCookie, true)
    .catch(() => {
      return undefined;
    });

  if (idToken) {
    return { success: false };
  } else {
    return { success: true };
  }
});

// Types //
type Rule = string;
type ErrorHandler = (error: string) => void;
type RuleResult = Promise<{
  success: boolean;
  error?: string;
}>;

interface ProtectedRouteProps {
  rules: Rule[];
  fallbackRoute: string;
  errorHandler?: ErrorHandler;
  children: React.ReactNode;
}

// Functions //
async function enforceRules(rules: Rule[]): RuleResult {
  for (const rule of rules) {
    // Check if rule exist or skip it
    if (!ruleCallbacks.has(rule as string)) {
      console.log(`Skipped rule ${rule as string}: Rule not found`);
      continue;
    }

    // Try to enforce the rule
    try {
      const { success } = await ruleCallbacks.get(rule as string)!(
        await cookies()
      );

      // Runs if rule didnt pass
      if (!success) {
        return { success, error: undefined };
      }
    } catch (error) {
      // If it errors, return an error
      console.log(`Error while enforcing rule ${rule as string}: ${error}`);

      if (error instanceof Error) {
        return { success: false, error: error.message };
      } else {
        return { success: false, error: String(error) };
      }
    }
  }

  // Runs if everything passed
  return { success: true, error: undefined };
}

export default async function ProtectedRoute({
  rules,
  fallbackRoute,
  errorHandler,
  children,
}: ProtectedRouteProps) {
  // Try to enforce rules given by the user
  const { success, error } = await enforceRules(rules);

  if (!success) {
    if (error) {
      errorHandler?.(error);
    }
    redirect(fallbackRoute);
  }

  return <>{children}</>;
}
