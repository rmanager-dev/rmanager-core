import { db } from "@rmanager/shared/db";
import { member } from "@rmanager/shared/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@rmanager/shared/lib/auth";
import { OrgPermissions } from "@rmanager/shared/lib/permissions";
import { AccessDenied } from "@rmanager/shared/lib/utils/api-utils";
import { createMiddleware } from "hono/factory";

export type OrgMemberMiddlewareVar = {
  session: typeof auth.$Infer.Session;
  member: typeof member.$inferSelect;
};
export const requireOrgMember = createMiddleware<{
  Variables: OrgMemberMiddlewareVar;
}>(async (c, next) => {
  const orgId = c.req.param("orgId");
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session || !orgId) throw AccessDenied;

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.userId, session.user.id),
      eq(member.organizationId, orgId),
    ),
  });

  if (!membership) throw AccessDenied;

  c.set("session", session);
  c.set("member", membership);
  return await next();
});

export type OrgPermMiddlewareVar = { session: typeof auth.$Infer.Session };
export const requireOrgPermission = (permissions: OrgPermissions) =>
  createMiddleware<{ Variables: OrgPermMiddlewareVar }>(async (c, next) => {
    const orgId = c.req.param("orgId");
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session || !orgId) throw AccessDenied;

    const { success } = await auth.api.hasPermission({
      headers: c.req.raw.headers,
      body: { organizationId: orgId, permissions },
    });
    if (!success) throw AccessDenied;

    c.set("session", session);
    return await next();
  });
