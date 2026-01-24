import { db } from "@/src/db";
import { user } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { AccessDenied, AuthenticationRequired } from "./errors";

export async function CheckUserExist(UserId: string): Promise<boolean> {
  const userProfile = await db.query.user.findFirst({
    where: eq(user.id, UserId),
    columns: { id: true },
  });
  return !!userProfile;
}

export const SUDO_MODES = {
  STRICT: 5 * 60 * 1000,
  STANDARD: 10 * 60 * 1000,
} as const;

export async function validateSudoMode(request: Request, duration?: number) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    throw AccessDenied;
  }

  const lastAuthTime = new Date(session.session.updatedAt).getTime();
  const now = new Date().getTime();

  if (now - lastAuthTime > (duration ?? SUDO_MODES.STANDARD)) {
    throw AuthenticationRequired;
  }
  return session;
}
