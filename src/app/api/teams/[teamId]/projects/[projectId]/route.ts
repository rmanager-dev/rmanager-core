import { auth } from "@/src/lib/auth";
import { RenameProjectSchema } from "@/src/lib/types/project-types";
import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { ProjectService } from "@/src/services/ProjectService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";

interface Context {
  params: Promise<{
    teamId: string;
    projectId: string;
  }>;
}

export async function GET(_: Request, context: Context) {
  const params = await context.params;
  const teamId = params.teamId;
  const projectId = params.projectId;

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const project = await ProjectService.GetProject(
      session.user.id,
      teamId,
      projectId,
    );
    return NextResponse.json(project);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

export async function PATCH(req: Request, context: Context) {
  const params = await context.params;
  const teamId = params.teamId;
  const projectId = params.projectId;

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const validatedData = RenameProjectSchema.parse(body);
    const updatedProject = await ProjectService.RenameProject(
      session.user.id,
      teamId,
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

export async function DELETE(_: Request, context: Context) {
  const params = await context.params;
  const teamId = params.teamId;
  const projectId = params.projectId;

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deletedProject = await ProjectService.DeleteProject(
      session.user.id,
      teamId,
      projectId,
    );
    return NextResponse.json(deletedProject);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
