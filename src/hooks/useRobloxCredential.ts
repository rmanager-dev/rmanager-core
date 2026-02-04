import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTeam } from "./useTeam";
import { RobloxCredentialController } from "../controllers/RobloxCredentialController";
import { useEffect } from "react";
import { hasPermission } from "../lib/utils/team-utils";
import { useRouter } from "next/navigation";
import {
  RobloxCredential,
  RobloxCredentialInfo,
} from "../lib/types/roblox-credentials-types";

export function useRobloxCredentials() {
  const router = useRouter();
  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
  } = useTeam();

  const query = useQuery({
    queryKey: ["robloxCredentials", team?.id],
    queryFn: () => RobloxCredentialController.list(team!.id),
    enabled: !!team?.id,
  });

  useEffect(() => {
    if (team && !hasPermission(team.role, "ListRobloxCredentials")) {
      router.replace(`/dashboard/${team.slug}`);
    }
  }, [team]);

  const isLoading = isTeamLoading || query.isLoading;
  const isError = isTeamError || query.isError;

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
      teamId,
      data,
    }: {
      teamId: string;
      data: RobloxCredentialInfo;
    }) => RobloxCredentialController.link(teamId, data),
    onSuccess: (newCred, variables) => {
      queryClient.setQueryData<RobloxCredential[]>(
        ["robloxCredentials", variables.teamId],
        (prevData) => {
          if (!prevData) return [newCred];
          return [...prevData, newCred];
        },
      );
    },
  });

  const deleteRobloxCredential = useMutation({
    mutationFn: ({ teamId, credId }: { teamId: string; credId: string }) =>
      RobloxCredentialController.delete(teamId, credId),
    onSuccess: (oldCred, variables) => {
      queryClient.setQueryData<RobloxCredential[]>(
        ["robloxCredentials", variables.teamId],
        (prevData) => {
          if (!prevData) return prevData;
          return prevData.filter((cred) => cred.id !== oldCred.id);
        },
      );
    },
  });

  const renameRobloxCredential = useMutation({
    mutationFn: ({
      teamId,
      credId,
      newName,
    }: {
      teamId: string;
      credId: string;
      newName: string;
    }) => RobloxCredentialController.rename(teamId, credId, newName),
    onSuccess: (renamedCred, variables) => {
      queryClient.setQueryData<RobloxCredential[]>(
        ["robloxCredentials", variables.teamId],
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
      teamId,
      credId,
      newKey,
    }: {
      teamId: string;
      credId: string;
      newKey: string;
    }) => RobloxCredentialController.rotate(teamId, credId, newKey),
  });

  return {
    linkRobloxCredential,
    deleteRobloxCredential,
    renameRobloxCredential,
    rotateRobloxCredential,
  };
}
