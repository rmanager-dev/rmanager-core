import { auth } from "@/src/lib/auth";
import { ErrorToNextResponse } from "@/src/lib/utils/errors";
import { ExternalDatabaseService } from "@/src/services/ExternalDatabaseService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";

interface Context {
  params: Promise<{
    id: string[];
  }>;
}

export async function DELETE(req: Request, context: Context) {
  const params = await context.params;
  const databaseId = params.id?.[0];
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
    await ExternalDatabaseService.DeleteDatabase(session.user.id, databaseId);
    return NextResponse.json({ message: "Database deleted successfully" });
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}

const PatchSchema = z.object({
  name: z.string().min(1).max(64),
});
export async function PATCH(req: Request, context: Context) {
  const params = await context.params;
  const databaseId = params.id?.[0];
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
