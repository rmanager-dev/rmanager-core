import { auth } from "@/src/lib/auth";
import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { isSafeEndpointUrl } from "@/src/lib/utils/url-utils";
import { ExternalDatabaseService } from "@/src/services/ExternalDatabaseService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";

interface Context {
  params: Promise<{
    teamId: string;
  }>;
}

export async function GET(_: Request, context: Context) {
  const params = await context.params;
  const teamId = params.teamId;

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const databases = await ExternalDatabaseService.ListDatabase(
      session.user.id,
      teamId,
    );
    return NextResponse.json(databases);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

const PostSchema = z.object({
  type: z.enum(["S3"]).default("S3"),
  name: z.string().min(1).max(64),
  endpoint: z
    .url("Invalid URL")
    .max(2048, "Max URL length exceeded")
    .refine(isSafeEndpointUrl, "Endpoint URL must be a public HTTPS address"),
  region: z.string().min(1).max(50),
  bucketName: z.string().min(1).max(100),
  accessKey: z.string().min(1).max(256),
  secretKey: z.string().min(1).max(256),
});

export async function POST(req: Request, context: Context) {
  const params = await context.params;
  const teamId = params.teamId;

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  // Fetch user session from auth cookie
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Require user to be logged in to make this request
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    // Validate the request's data using zod (errors if malformed)
    const validatedData = PostSchema.parse(body);

    // Link database to user using request data
    const result = await ExternalDatabaseService.LinkDatabase(
      session.user.id,
      teamId,
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
