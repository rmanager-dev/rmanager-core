import { team_member } from "@/src/db/schema";
import { auth } from "@/src/lib/auth";
import { ErrorToNextResponse } from "@/src/lib/utils/errors";
import { TeamService } from "@/src/services/TeamService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";

interface Context {
  params: Promise<{
    teamId: string;
    memberId: string;
  }>;
}

export async function DELETE(req: Request, context: Context) {
  const params = await context.params;
  const teamId = params.teamId;
  const memberId = params.memberId;

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }
  if (!memberId) {
    return NextResponse.json(
      { error: "Member ID is required" },
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
    await TeamService.RemoveTeamMember(session.user.id, memberId, teamId);
    return NextResponse.json({ memberId });
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

const PatchSchema = z.object({
  targetId: z.string(),
  newRole: z.enum(team_member.role.enumValues),
});
export async function PATCH(req: Request, context: Context) {
  const params = await context.params;
  const teamId = params.teamId?.[0];
  const memberId = params.memberId?.[0];

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }
  if (!memberId) {
    return NextResponse.json(
      { error: "Member ID is required" },
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
      { error: "Invalid request body " },
      { status: 400 },
    );
  }

  try {
    const validatedData = PatchSchema.parse(body);
    const newMember = await TeamService.UpdateTeamMemberRole(
      session.user.id,
      validatedData.targetId,
      teamId,
      validatedData.newRole,
    );
    return NextResponse.json(newMember);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return ErrorToNextResponse(error);
  }
}
