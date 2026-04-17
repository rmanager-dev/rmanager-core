import { db } from "../../db";
import { user, member } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "../auth";
import { OrgPermissions } from "../permissions";
import { AccessDenied } from "./api-utils";

export async function CheckUserExist(UserId: string): Promise<boolean> {
  const userProfile = await db.query.user.findFirst({
    where: eq(user.id, UserId),
    columns: { id: true },
  });
  return !!userProfile;
}

export async function requireOrgMember(req: Request, organizationId: string) {
  const headers = req.headers;
  const session = await auth.api.getSession({ headers });

  if (!session) throw AccessDenied;

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.userId, session.user.id),
      eq(member.organizationId, organizationId),
    ),
  });

  if (!membership) throw AccessDenied;

  return { session, member: membership };
}

export async function requireOrgPermission(
  req: Request,
  organizationId: string,
  permissions: OrgPermissions,
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
