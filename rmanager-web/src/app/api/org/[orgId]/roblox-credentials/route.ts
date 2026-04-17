import { RobloxCredentialInfoSchema } from "@rmanager/shared/lib/types/roblox-credentials-types";
import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import {
  requireOrgMember,
  requireOrgPermission,
} from "@rmanager/shared/lib/utils/auth-utils";
import { RobloxCredentialsService } from "@rmanager/shared/services/RobloxCredentialsService";
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{
    orgId: string;
  }>;
}

export async function GET(req: Request, context: Context) {
  const { orgId } = await context.params;
  if (!orgId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 },
    );
  }

  try {
    await requireOrgMember(req, orgId);
    const credentials =
      await RobloxCredentialsService.ListOrganizationRobloxCredentials(orgId);
    return NextResponse.json(credentials);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

export async function POST(req: Request, context: Context) {
  const { orgId } = await context.params;
  if (!orgId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 },
    );
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
    const session = await requireOrgPermission(req, orgId, {
      roblox_credential: ["create"],
    });
    const newCredential = await RobloxCredentialsService.LinkRobloxCredential(
      session.user.id,
      orgId,
      validatedData,
    );
    return NextResponse.json(newCredential);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
