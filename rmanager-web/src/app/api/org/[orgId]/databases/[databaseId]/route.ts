import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { ExternalDatabaseService } from "@rmanager/shared/services/ExternalDatabaseService";
import { DatabaseRenameSchema, DatabaseRotateSchema } from "@rmanager/shared/lib/types/database-types";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireOrgPermission } from "@rmanager/shared/lib/utils/auth-utils";

interface Context {
  params: Promise<{
    orgId: string;
    databaseId: string;
  }>;
}

export async function DELETE(req: Request, context: Context) {
  const params = await context.params;

  const databaseId = params.databaseId;
  const orgId = params.orgId;

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
    await requireOrgPermission(req, orgId, { database: ["delete"] });
    const deletedDb = await ExternalDatabaseService.DeleteDatabase(
      orgId,
      databaseId,
    );
    return NextResponse.json(deletedDb);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

const PatchSchema = DatabaseRenameSchema;
export async function PATCH(req: Request, context: Context) {
  const params = await context.params;

  const orgId = params.orgId;
  const databaseId = params.databaseId;

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
    await requireOrgPermission(req, orgId, { database: ["rename"] });
    const validatedSchema = PatchSchema.parse(body);

    const newDb = await ExternalDatabaseService.RenameDatabase(
      orgId,
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
  const orgId = params.orgId;
  const databaseId = params.databaseId;

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
    await requireOrgPermission(req, orgId, { database: ["rotate"] });
    const rotatedDb = await ExternalDatabaseService.RotateDatabaseCredentials(
      orgId,
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
