import { auth } from "@/src/lib/auth";
import { ErrorToNextResponse } from "@/src/lib/utils/api-utils";
import { TeamService } from "@/src/services/TeamService";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface Context {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: Request, context: Context) {
  const params = await context.params;
  const slug = params.slug;

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
    const data = await TeamService.GetTeamBySlug(session.user.id, slug);
    return NextResponse.json(data);
  } catch (error) {
    return ErrorToNextResponse(error);
  }
}
