"use server";

import { auth } from "@rmanager/shared/lib/auth";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Project } from "@rmanager/shared/lib/types/project-types";
import { serverFetcher } from "@/src/lib/utils/fetcher-server";

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

  await serverFetcher<Project>(
    `/org/${org?.id}/projects/resolve-slug/${projectSlug}`,
  )
    .then((project) =>
      queryClient.setQueryData(["project", org!.id, projectSlug], project),
    )
    .catch((error) => {
      console.log(error);
      redirect(`/dashboard/${orgSlug}`);
    });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
