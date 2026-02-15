import { auth } from "@/src/lib/auth";
import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { TeamService } from "@/src/services/TeamService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";

interface Context {
  params: Promise<{
    teamId: string;
  }>;
}

export async function DELETE(_: Request, context: Context) {
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
    const team = await TeamService.DeleteTeam(session.user.id, teamId);
    return NextResponse.json(team);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

const PatchSchema = z.object({
  name: z.string().min(3).max(32).optional(),
  displayName: z.string().min(3).max(32).optional(),
});
export async function PATCH(req: Request, context: Context) {
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
      { error: "Invalid request body " },
      { status: 400 },
    );
  }

  try {
    const validatedData = PatchSchema.parse(body);

    const result = await TeamService.ChangeTeamName(
      session.user.id,
      teamId,
      validatedData,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return ErrorToNextResponse(error);
  }
}
