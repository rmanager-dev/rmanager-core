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
  const h = await headers();

  let org;
  try {
    org = await auth.api.getFullOrganization({
      headers: h,
      query: { organizationSlug: orgSlug },
    });
  } catch {
    redirect("/dashboard");
  }

  await queryClient.prefetchQuery({
    queryKey: ["organization", orgSlug],
    queryFn: async () =>
      await auth.api.getFullOrganization({
        headers: h,
        query: { organizationSlug: orgSlug },
      }),
  });

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
