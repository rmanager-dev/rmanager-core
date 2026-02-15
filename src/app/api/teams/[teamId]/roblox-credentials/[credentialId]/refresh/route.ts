import { auth } from "@/src/lib/auth";
import { AccessDenied, ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { RobloxCredentialsService } from "@/src/services/RobloxCredentialsService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{
    teamId: string;
    credentialId: string;
  }>;
}

export async function POST(context: Context) {
  const { teamId, credentialId } = await context.params;
  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }
  if (!credentialId) {
    return NextResponse.json(
      { error: "Credential ID is required" },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return ErrorToNextResponse(AccessDenied);
  }

  try {
    const newCred = await RobloxCredentialsService.RefreshRobloxCredential(
      session.user.id,
      teamId,
      credentialId,
    );
    return NextResponse.json(newCred);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
