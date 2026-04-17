import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RobloxCredentialController } from "../controllers/RobloxCredentialController";
import {
  RobloxCredential,
  RobloxCredentialInfo,
} from "../lib/types/roblox-credentials-types";
import { useOrg } from "./useOrg";

export function useRobloxCredentials() {
  const { data: org, isLoading: isOrgLoading, isError: isOrgError } = useOrg();

  const query = useQuery({
    queryKey: ["robloxCredentials", org?.id],
    queryFn: () => RobloxCredentialController.list(org!.id),
    enabled: !!org?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isOrgLoading || query.isLoading;
  const isError = isOrgError || query.isError;

  return {
    ...query,
    isLoading,
    isError,
  };
}

export function useRobloxCredentialMutations() {
  const queryClient = useQueryClient();

  const linkRobloxCredential = useMutation({
    mutationFn: ({
      orgId,
      data,
    }: {
      orgId: string;
      data: RobloxCredentialInfo;
    }) => RobloxCredentialController.link(orgId, data),
    onSuccess: (newCred, variables) => {
      queryClient.setQueryData<RobloxCredential[]>(
        ["robloxCredentials", variables.orgId],
        (prevData) => {
          if (!prevData) return [newCred];
          return [...prevData, newCred];
        },
      );
    },
  });

  const deleteRobloxCredential = useMutation({
    mutationFn: ({ orgId, credId }: { orgId: string; credId: string }) =>
      RobloxCredentialController.delete(orgId, credId),
    onSuccess: (oldCred, variables) => {
      queryClient.setQueryData<RobloxCredential[]>(
        ["robloxCredentials", variables.orgId],
        (prevData) => {
          if (!prevData) return prevData;
          return prevData.filter((cred) => cred.id !== oldCred.id);
        },
      );
    },
  });

  const renameRobloxCredential = useMutation({
    mutationFn: ({
      orgId,
      credId,
      newName,
    }: {
      orgId: string;
      credId: string;
      newName: string;
    }) => RobloxCredentialController.rename(orgId, credId, newName),
    onSuccess: (renamedCred, variables) => {
      queryClient.setQueryData<RobloxCredential[]>(
        ["robloxCredentials", variables.orgId],
        (prevData) => {
          if (!prevData) return [renamedCred];
          return prevData.map((cred) =>
            cred.id == renamedCred.id ? renamedCred : cred,
          );
        },
      );
    },
  });

  const rotateRobloxCredential = useMutation({
    mutationFn: ({
      orgId,
      credId,
      newKey,
    }: {
      orgId: string;
      credId: string;
      newKey: string;
    }) => RobloxCredentialController.rotate(orgId, credId, newKey),
    onSuccess: (rotatedCred, variables) => {
      queryClient.setQueryData<RobloxCredential[]>(
        ["robloxCredentials", variables.orgId],
        (prevData) => {
          if (!prevData) return [rotatedCred];
          return prevData.map((cred) =>
            cred.id == rotatedCred.id ? rotatedCred : cred,
          );
        },
      );
    },
  });

  const refreshRobloxCredential = useMutation({
    mutationFn: ({ orgId, credId }: { orgId: string; credId: string }) =>
      RobloxCredentialController.refresh(orgId, credId),
    onSuccess: (refreshedCred, variables) => {
      queryClient.setQueryData<RobloxCredential[]>(
        ["robloxCredentials", variables.orgId],
        (prevData) => {
          if (!prevData) return [refreshedCred];
          return prevData.map((cred) =>
            cred.id === refreshedCred.id ? refreshedCred : cred,
          );
        },
      );
    },
  });

  return {
    linkRobloxCredential,
    deleteRobloxCredential,
    renameRobloxCredential,
    rotateRobloxCredential,
    refreshRobloxCredential,
  };
}
