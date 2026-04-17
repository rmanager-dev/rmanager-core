import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Organization } from "better-auth/plugins";
import { authClient } from "../lib/auth-client";
import { errorFromBetterAuth } from "../lib/utils";
import {
  OrgPermissions,
  owner,
  admin,
  developer,
  viewer,
} from "@rmanager/shared/lib/permissions";

const orgRoles = { owner, admin, developer, viewer };

export function useOrg() {
  const { orgSlug } = useParams();

  const query = useQuery({
    queryKey: ["organization", orgSlug],
    queryFn: async () => {
      const org = await authClient.organization.getFullOrganization({
        query: { organizationSlug: orgSlug as string },
      });
      return org.data;
    },
    enabled: !!orgSlug,
    staleTime: 5 * 60 * 1000,
  });

  return query;
}

export function useOrgs() {
  const query = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const orgs = await authClient.organization.list();
      return orgs.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return query;
}

export function usePermissions<T extends Record<string, OrgPermissions>>(
  permissions: T,
): Record<keyof T, boolean> | undefined {
  const { data: org } = useOrg();
  const { data: session } = authClient.useSession();

  return useMemo(() => {
    if (!org || !session) return undefined;

    const membership = org.members?.find((m) => m.userId === session.user.id);
    if (!membership) return undefined;

    const role = orgRoles[membership.role as keyof typeof orgRoles] as {
      authorize: (request: OrgPermissions) => { success: boolean };
    };
    if (!role) return undefined;

    return Object.fromEntries(
      Object.entries(permissions).map(([key, permission]) => [
        key,
        role.authorize(permission).success,
      ]),
    ) as Record<keyof T, boolean>;
  }, [org, session]);
}

async function organizationErrorWrapper<T>(
  callback: () => Promise<{ data: T | null; error: unknown }>,
): Promise<T> {
  const { data, error } = await callback();
  if (error) throw errorFromBetterAuth(error);
  return data!;
}

export function useOrgMutations() {
  const queryClient = useQueryClient();

  const createOrg = useMutation({
    mutationFn: ({ name, slug }: { name: string; slug: string }) =>
      organizationErrorWrapper(() =>
        authClient.organization.create({ name, slug }),
      ),
    onSuccess: (org) => {
      queryClient.setQueryData<Organization[]>(
        ["organizations"],
        (prevData) => {
          if (!prevData) return [org];
          return [...prevData, org];
        },
      );

      queryClient.setQueryData<Organization>(["organization", org.slug], org);
    },
  });

  const deleteOrg = useMutation({
    mutationFn: ({ organizationId }: { organizationId: string }) =>
      organizationErrorWrapper(() =>
        authClient.organization.delete({ organizationId }),
      ),
    onSuccess: (deletedOrg, variables) => {
      queryClient.setQueryData<Organization[]>(
        ["organizations"],
        (prevData) => {
          if (!prevData) return prevData;
          return prevData.filter((org) => org.id !== variables.organizationId);
        },
      );

      queryClient.removeQueries({
        queryKey: ["organization", deletedOrg.slug],
      });
    },
  });

  const leaveOrg = useMutation({
    mutationFn: ({ organizationId }: { organizationId: string }) =>
      organizationErrorWrapper(() =>
        authClient.organization.leave({ organizationId }),
      ),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Organization[]>(
        ["organizations"],
        (prevData) => {
          if (!prevData) return prevData;
          return prevData.filter((org) => org.id !== variables.organizationId);
        },
      );
    },
  });

  const updateOrg = useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: { name?: string; slug?: string; logo?: string };
    }) =>
      organizationErrorWrapper(() =>
        authClient.organization.update({ organizationId, data }),
      ),
    onSuccess: (updatedOrg) => {
      queryClient.setQueryData<Organization[]>(
        ["organizations"],
        (prevData) => {
          if (!prevData) return prevData;
          return prevData.map((org) =>
            org.id === updatedOrg.id ? updatedOrg : org,
          );
        },
      );

      queryClient.setQueryData<Organization>(
        ["organization", updatedOrg.slug],
        (prevData) => ({ ...prevData, ...updatedOrg }),
      );
    },
  });

  return { createOrg, deleteOrg, leaveOrg, updateOrg };
}
