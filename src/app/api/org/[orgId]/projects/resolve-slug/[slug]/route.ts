import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import {
  requireOrgMember,
  requireOrgPermission,
} from "@/src/lib/utils/auth-utils";
import { ProjectService } from "@/src/services/ProjectService";
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{
    orgId: string;
    slug: string;
  }>;
}

export async function GET(req: Request, context: Context) {
  const params = await context.params;
  const orgId = params.orgId;
  const slug = params.slug;

  if (!orgId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 },
    );
  }

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  try {
    await requireOrgMember(req, orgId);
    const data = await ProjectService.GetProjectBySlug(orgId, slug);
    return NextResponse.json(data);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
