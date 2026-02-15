import { auth } from "@/src/lib/auth";
import {
  RobloxCredentialRenameSchema,
  RobloxCredentialRotateSchema,
} from "@/src/lib/types/roblox-credentials-types";
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

export async function DELETE(context: Context) {
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
    const deletedCredential =
      await RobloxCredentialsService.DeleteRobloxCredential(
        session.user.id,
        teamId,
        credentialId,
      );
    return NextResponse.json(deletedCredential);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

export async function PATCH(req: Request, context: Context) {
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
    const renamedCredential =
      await RobloxCredentialsService.RenameRobloxCredential(
        session.user.id,
        teamId,
        credentialId,
        validatedData.name,
      );
    return NextResponse.json(renamedCredential);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

export async function POST(req: Request, context: Context) {
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
    const rotatedCred = await RobloxCredentialsService.RotateRobloxCredential(
      session.user.id,
      teamId,
      credentialId,
      validatedData.key,
    );
    return NextResponse.json(rotatedCred);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
