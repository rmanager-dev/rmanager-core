"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserTeam } from "../lib/types/team-types";
import { TeamController } from "../controllers/TeamController";

export function useTeam() {
  const { teamSlug } = useParams();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => TeamController.resolve(teamSlug as string),
    enabled: !!teamSlug,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.isError) {
      router.push("/dashboard");
    }
  }, [query.isError, router]);

  return query;
}

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => TeamController.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeamMutations() {
  const queryClient = useQueryClient();

  const createTeam = useMutation({
    mutationFn: (name: string) => TeamController.create(name),
    onSuccess: (team) => {
      // Add the newly created team to the teams list
      queryClient.setQueryData<UserTeam[]>(["teams"], (prevData) => {
        if (!prevData) return [team];
        return [...prevData, team];
      });
    },
  });

  const deleteTeam = useMutation({
    mutationFn: (teamId: string) => TeamController.delete(teamId),
    onSuccess: (oldTeam) => {
      // Remove old team from the teams list
      queryClient.setQueryData<UserTeam[]>(["teams"], (prevData) => {
        if (!prevData) return prevData;
        return prevData.filter((team) => team.id !== oldTeam.id);
      });

      // Clear the team data cache
      queryClient.removeQueries({ queryKey: ["team", oldTeam.slug] });
    },
  });

  const renameTeam = useMutation({
    mutationFn: ({ teamId, newName }: { teamId: string; newName: string }) =>
      TeamController.changeName(teamId, newName),
    onSuccess: (newTeam, variables) => {
      queryClient.setQueryData<UserTeam[]>(["teams"], (prevData) => {
        if (!prevData) return [newTeam];
        return prevData.map((t) => (t.id == newTeam.id ? newTeam : t));
      });

      queryClient.setQueryData(["team", newTeam.slug], () => newTeam);
    },
  });

  return { createTeam, deleteTeam, renameTeam };
}
