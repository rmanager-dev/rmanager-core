import { auth } from "@/src/lib/auth";
import { ErrorToNextResponse } from "@/src/lib/utils/errors";
import { TeamService } from "@/src/services/TeamService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teams = await TeamService.ListUserTeams(session.user.id);
    return NextResponse.json(teams);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

const PostSchema = z.object({
  name: z.string().min(3).max(32),
});
export async function POST(req: Request) {
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
    const validatedData = PostSchema.parse(body);
    const newTeam = await TeamService.CreateTeam(
      session.user.id,
      validatedData.name,
    );
    return NextResponse.json(newTeam);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return ErrorToNextResponse(error);
  }
}
