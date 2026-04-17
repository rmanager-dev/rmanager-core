import { RenameProjectSchema } from "@rmanager/shared/lib/types/project-types";
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
    projectId: string;
  }>;
}

export async function GET(req: Request, context: Context) {
  const params = await context.params;
  const orgId = params.orgId;
  const projectId = params.projectId;

  if (!orgId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 },
    );
  }

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 },
    );
  }

  try {
    await requireOrgMember(req, orgId);
    const project = await ProjectService.GetProject(orgId, projectId);
    return NextResponse.json(project);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

export async function PATCH(req: Request, context: Context) {
  const params = await context.params;
  const orgId = params.orgId;
  const projectId = params.projectId;

  if (!orgId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 },
    );
  }

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
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
    await requireOrgPermission(req, orgId, { project: ["rename"] });
    const validatedData = RenameProjectSchema.parse(body);
    const updatedProject = await ProjectService.RenameProject(
      orgId,
      projectId,
      validatedData.name,
    );
    return NextResponse.json(updatedProject);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return ErrorToNextResponse(error);
  }
}

export async function DELETE(req: Request, context: Context) {
  const params = await context.params;
  const orgId = params.orgId;
  const projectId = params.projectId;

  if (!orgId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 },
    );
  }

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 },
    );
  }

  try {
    await requireOrgPermission(req, orgId, { project: ["delete"] });
    const deletedProject = await ProjectService.DeleteProject(orgId, projectId);
    return NextResponse.json(deletedProject);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
