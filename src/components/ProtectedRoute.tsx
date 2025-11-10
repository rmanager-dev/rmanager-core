import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { auth } from "../lib/auth";

// Rules //
const ruleCallbacks: Map<string, () => RuleResult> = new Map();

ruleCallbacks.set("requireLoggedIn", async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return { success: true };
  } else {
    return { success: false };
  }
});

ruleCallbacks.set("requireLoggedOff", async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: true };
  } else {
    return { success: false };
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
      const { success } = await ruleCallbacks.get(rule as string)!();

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
