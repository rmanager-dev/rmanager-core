"use client";
import { useQuery } from "@tanstack/react-query";
import { useTeam } from "./useTeam";
import { TeamController } from "../controllers/TeamController";

export function useMembers() {
  const {
    data: team,
    isLoading: isLoadingTeam,
    isError: isErrorTeam,
  } = useTeam();

  const query = useQuery({
    queryKey: ["members", team?.id],
    queryFn: () => TeamController.listMembers(team!.id),
    enabled: !!team?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isLoadingTeam || query.isLoading;
  const isError = isErrorTeam || query.isError;

  return {
    ...query,
    isLoading,
    isError,
  };
}
