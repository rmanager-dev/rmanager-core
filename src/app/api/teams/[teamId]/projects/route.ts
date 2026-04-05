import { auth } from "@/src/lib/auth";
import { CreateProjectSchema } from "@/src/lib/types/project-types";
import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { ProjectService } from "@/src/services/ProjectService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";

interface Context {
  params: Promise<{
    teamId: string;
  }>;
}

export async function GET(_: Request, context: Context) {
  const params = await context.params;
  const teamId = params.teamId;

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await ProjectService.ListTeamProjects(
      session.user.id,
      teamId,
    );
    return NextResponse.json(projects);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

export async function POST(req: Request, context: Context) {
  const params = await context.params;
  const teamId = params.teamId;

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
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
    const validatedData = CreateProjectSchema.parse(body);
    const newProject = await ProjectService.CreateProject(
      session.user.id,
      teamId,
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
