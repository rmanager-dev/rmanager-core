import { auth } from "@/src/lib/auth";
import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { ProjectService } from "@/src/services/ProjectService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{
    teamId: string;
    slug: string;
  }>;
}

export async function GET(_: Request, context: Context) {
  const params = await context.params;
  const teamId = params.teamId;
  const slug = params.slug;

  if (!teamId) {
    return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await ProjectService.GetProjectBySlug(
      session.user.id,
      teamId,
      slug,
    );
    return NextResponse.json(data);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
