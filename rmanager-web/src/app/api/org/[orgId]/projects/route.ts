import { CreateProjectSchema } from "@rmanager/shared/lib/types/project-types";
import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import {
  requireOrgMember,
  requireOrgPermission,
} from "@rmanager/shared/lib/utils/auth-utils";
import { ProjectService } from "@rmanager/shared/services/ProjectService";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

interface Context {
  params: Promise<{
    orgId: string;
  }>;
}

export async function GET(req: Request, context: Context) {
  const params = await context.params;
  const orgId = params.orgId;

  if (!orgId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 },
    );
  }

  try {
    await requireOrgMember(req, orgId);
    const projects = await ProjectService.ListOrganizationProjects(orgId);
    return NextResponse.json(projects);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

export async function POST(req: Request, context: Context) {
  const params = await context.params;
  const orgId = params.orgId;

  if (!orgId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    await requireOrgPermission(req, orgId, { project: ["create"] });
    const validatedData = CreateProjectSchema.parse(body);
    const newProject = await ProjectService.CreateProject(
      orgId,
      validatedData.name,
    );
    return NextResponse.json(newProject);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return ErrorToNextResponse(error);
  }
}
