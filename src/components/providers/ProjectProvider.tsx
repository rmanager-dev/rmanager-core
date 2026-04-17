"use server";

import { auth } from "@/src/lib/auth";
import { ProjectService } from "@/src/services/ProjectService";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProjectProvider({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string; projectSlug: string }>;
}) {
  const queryClient = new QueryClient();
  const { orgSlug, projectSlug } = await params;

  const org = await auth.api
    .getFullOrganization({
      headers: await headers(),
      query: { organizationSlug: orgSlug },
    })
    .catch(() => redirect("/dashboard"));

  await ProjectService.GetProjectBySlug(org!.id, projectSlug)
    .then((project) => queryClient.setQueryData(["project", org!.id, projectSlug], project))
    .catch(() => redirect(`/dashboard/${orgSlug}`));

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
