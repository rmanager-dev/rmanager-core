import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import {
  requireOrgMember,
  requireOrgPermission,
} from "@rmanager/shared/lib/utils/auth-utils";
import { DatabaseCreateSchema } from "@rmanager/shared/lib/types/database-types";
import { ExternalDatabaseService } from "@rmanager/shared/services/ExternalDatabaseService";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

interface Context {
  params: Promise<{
    orgId: string;
  }>;
}

export async function GET(req: Request, context: Context) {
  const params = await context.params;
  const orgId = params.orgId;

  if (!orgId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 },
    );
  }

  try {
    await requireOrgMember(req, orgId); // Check if the user is in the organization (no special permissions needed to list databases)
    const databases = await ExternalDatabaseService.ListDatabase(orgId);
    return NextResponse.json(databases);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

const PostSchema = DatabaseCreateSchema;

export async function POST(req: Request, context: Context) {
  const params = await context.params;
  const orgId = params.orgId;

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
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    const session = await requireOrgPermission(req, orgId, {
      database: ["create"],
    });

    // Validate the request's data using zod (errors if malformed)
    const validatedData = PostSchema.parse(body);

    // Link database to user using request data
    const result = await ExternalDatabaseService.LinkDatabase(
      session.user.id,
      orgId,
      validatedData.name,
      {
        EndpointURL: validatedData.endpoint,
        Region: validatedData.region,
        BucketName: validatedData.bucketName,
        AccessKeyID: validatedData.accessKey,
        SecretAccessKey: validatedData.secretKey,
      },
    );

    // Return the created database infos
    return NextResponse.json(result);
  } catch (error) {
    // Zod error = malformed request
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return ErrorToNextResponse(error);
  }
}
