import { auth } from "@/src/lib/auth";
import { AccessDenied, ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { ExternalDatabaseService } from "@/src/services/ExternalDatabaseService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{
    teamId: string;
    databaseId: string;
  }>;
}

export async function POST(_: Request, context: Context) {
  const { teamId, databaseId } = await context.params;

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }
  if (!databaseId) {
    return NextResponse.json(
      { error: "Database ID is required" },
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
    const refreshedDb = await ExternalDatabaseService.RefreshDatabase(
      session.user.id,
      teamId,
      databaseId,
    );
    return NextResponse.json(refreshedDb);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
