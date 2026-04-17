import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { requireOrgPermission } from "@rmanager/shared/lib/utils/auth-utils";
import { ExternalDatabaseService } from "@rmanager/shared/services/ExternalDatabaseService";
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{
    orgId: string;
    databaseId: string;
  }>;
}

export async function POST(req: Request, context: Context) {
  const { orgId, databaseId } = await context.params;

  if (!orgId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 },
    );
  }
  if (!databaseId) {
    return NextResponse.json(
      { error: "Database ID is required" },
      { status: 400 },
    );
  }

  try {
    await requireOrgPermission(req, orgId, { database: ["refresh"] });
    const refreshedDb = await ExternalDatabaseService.RefreshDatabase(
      orgId,
      databaseId,
    );
    return NextResponse.json(refreshedDb);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
