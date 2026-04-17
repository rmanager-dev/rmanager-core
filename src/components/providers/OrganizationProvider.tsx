"use server";

import { auth } from "@/src/lib/auth";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function OrganizationProvider({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const queryClient = new QueryClient();
  const { orgSlug } = await params;

  await auth.api
    .getFullOrganization({
      headers: await headers(),
      query: { organizationSlug: orgSlug },
    })
    .then((org) => queryClient.setQueryData(["organization", orgSlug], org))
    .catch(() => redirect("/dashboard"));

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
