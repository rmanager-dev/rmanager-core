import { auth } from "@/src/lib/auth";
import { AccessDenied, ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { ExternalDatabaseService } from "@/src/services/ExternalDatabaseService";
import { DatabaseRotateSchema } from "@/src/lib/types/database-types";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";

interface Context {
  params: Promise<{
    teamId: string;
    databaseId: string;
  }>;
}

export async function DELETE(_: Request, context: Context) {
  const params = await context.params;

  const databaseId = params.databaseId;
  const teamId = params.teamId;

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deletedDb = await ExternalDatabaseService.DeleteDatabase(
      session.user.id,
      teamId,
      databaseId,
    );
    return NextResponse.json(deletedDb);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

const PatchSchema = z.object({
  name: z.string().min(1).max(64),
});
export async function PATCH(req: Request, context: Context) {
  const params = await context.params;

  const teamId = params.teamId;
  const databaseId = params.databaseId;

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
    const validatedSchema = PatchSchema.parse(body);

    const newDb = await ExternalDatabaseService.RenameDatabase(
      session.user.id,
      teamId,
      databaseId,
      validatedSchema.name,
    );
    return NextResponse.json(newDb);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return ErrorToNextResponse(error);
  }
}

export async function POST(req: Request, context: Context) {
  const params = await context.params;
  const teamId = params.teamId;
  const databaseId = params.databaseId;

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

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid json body" }, { status: 400 });
  }

  let validatedData;
  try {
    validatedData = DatabaseRotateSchema.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid body request format" },
      { status: 400 },
    );
  }

  try {
    const rotatedDb = await ExternalDatabaseService.RotateDatabaseCredentials(
      session.user.id,
      teamId,
      databaseId,
      {
        AccessKeyID: validatedData.accessKey,
        SecretAccessKey: validatedData.secretKey,
      },
    );
    return NextResponse.json(rotatedDb);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
