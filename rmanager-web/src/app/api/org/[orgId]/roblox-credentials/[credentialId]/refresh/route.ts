import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { requireOrgPermission } from "@rmanager/shared/lib/utils/auth-utils";
import { RobloxCredentialsService } from "@rmanager/shared/services/RobloxCredentialsService";
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{
    orgId: string;
    credentialId: string;
  }>;
}

export async function POST(req: Request, context: Context) {
  const { orgId, credentialId } = await context.params;
  if (!orgId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 },
    );
  }
  if (!credentialId) {
    return NextResponse.json(
      { error: "Credential ID is required" },
      { status: 400 },
    );
  }

  try {
    await requireOrgPermission(req, orgId, { roblox_credential: ["refresh"] });
    const newCred = await RobloxCredentialsService.RefreshRobloxCredential(
      orgId,
      credentialId,
    );
    return NextResponse.json(newCred);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
