import { db } from "@/src/db";
import { user } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { NextResponse } from "next/server";
import { OrgPermissions } from "../permissions";
import { AccessDenied, ErrorToNextResponse } from "./api-utils";

export async function CheckUserExist(UserId: string): Promise<boolean> {
  const userProfile = await db.query.user.findFirst({
    where: eq(user.id, UserId),
    columns: { id: true },
  });
  return !!userProfile;
}

export async function requireOrgPermission(
  req: Request,
  organizationId: string,
  permissions?: OrgPermissions,
) {
  const headers = req.headers;
  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw AccessDenied;
  }

  const { success } = await auth.api.hasPermission({
    headers,
    body: { organizationId, permissions },
  });

  if (!success) {
    throw AccessDenied;
  } else {
    return session;
  }
}
