import {
  RobloxCredentialRenameSchema,
  RobloxCredentialRotateSchema,
} from "@/src/lib/types/roblox-credentials-types";
import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { requireOrgPermission } from "@/src/lib/utils/auth-utils";
import { RobloxCredentialsService } from "@/src/services/RobloxCredentialsService";
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{
    orgId: string;
    credentialId: string;
  }>;
}

export async function DELETE(req: Request, context: Context) {
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
    await requireOrgPermission(req, orgId, { roblox_credential: ["delete"] });
    const deletedCredential =
      await RobloxCredentialsService.DeleteRobloxCredential(
        orgId,
        credentialId,
      );
    return NextResponse.json(deletedCredential);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

export async function PATCH(req: Request, context: Context) {
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

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid json body" }, { status: 400 });
  }

  let validatedData;
  try {
    validatedData = RobloxCredentialRenameSchema.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid body request format" },
      { status: 400 },
    );
  }

  try {
    await requireOrgPermission(req, orgId, { roblox_credential: ["rename"] });
    const renamedCredential =
      await RobloxCredentialsService.RenameRobloxCredential(
        orgId,
        credentialId,
        validatedData.name,
      );
    return NextResponse.json(renamedCredential);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
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

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid json body" }, { status: 400 });
  }

  let validatedData;
  try {
    validatedData = RobloxCredentialRotateSchema.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid body request format" },
      { status: 400 },
    );
  }

  try {
    await requireOrgPermission(req, orgId, { roblox_credential: ["rotate"] });
    const rotatedCred = await RobloxCredentialsService.RotateRobloxCredential(
      orgId,
      credentialId,
      validatedData.key,
    );
    return NextResponse.json(rotatedCred);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
