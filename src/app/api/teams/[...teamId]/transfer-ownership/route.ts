import { auth } from "@/src/lib/auth";
import { SUDO_MODES, validateSudoMode } from "@/src/lib/utils/auth-utils";
import { ErrorToNextResponse } from "@/src/lib/utils/errors";
import { TeamService } from "@/src/services/TeamService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";

interface Context {
  params: Promise<{
    teamId: string[];
  }>;
}

const PostSchema = z.object({
  targetId: z.string(),
});
export async function POST(req: Request, context: Context) {
  const params = await context.params;
  const teamId = params.teamId?.[0];

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
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

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await validateSudoMode(req, SUDO_MODES.STRICT);
    const validatedData = PostSchema.parse(body);
    await TeamService.TransferOwnership(
      session.user.id,
      validatedData.targetId,
      teamId,
    );
    return NextResponse.json({
      old: session.user.id,
      new: validatedData.targetId,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return ErrorToNextResponse(error);
  }
}
