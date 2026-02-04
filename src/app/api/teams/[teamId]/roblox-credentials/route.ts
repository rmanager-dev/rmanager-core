import { auth } from "@/src/lib/auth";
import { RobloxCredentialInfoSchema } from "@/src/lib/types/roblox-credentials-types";
import { AccessDenied, ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { RobloxCredentialsService } from "@/src/services/RobloxCredentialsService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{
    teamId: string;
  }>;
}

export async function GET(req: Request, context: Context) {
  const { teamId } = await context.params;
  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return ErrorToNextResponse(AccessDenied);
  }

  try {
    const credentials =
      await RobloxCredentialsService.ListTeamRobloxCredentials(
        session.user.id,
        teamId,
      );
    return NextResponse.json(credentials);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

export async function POST(req: Request, context: Context) {
  const { teamId } = await context.params;
  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return ErrorToNextResponse(AccessDenied);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid json body" }, { status: 400 });
  }

  let validatedData;
  try {
    validatedData = RobloxCredentialInfoSchema.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid body request format" },
      { status: 400 },
    );
  }

  try {
    const newCredential = await RobloxCredentialsService.LinkRobloxCredential(
      session.user.id,
      teamId,
      validatedData,
    );
    return NextResponse.json(newCredential);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
