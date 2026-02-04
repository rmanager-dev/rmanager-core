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
  });
}

export function useTeamMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();

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
    mutationFn: ({
      teamId,
      payload,
    }: {
      teamId: string;
      payload: { name?: string; displayName?: string };
    }) => TeamController.changeName(teamId, payload),
    onSuccess: (newTeam, variables) => {
      const cachedTeam = queryClient.getQueryData<UserTeam[]>(["teams"]);
      const oldTeam = cachedTeam?.find((team) => team.id === variables.teamId);
      const oldSlug = oldTeam?.slug;

      // Update the teams list
      queryClient.setQueryData<UserTeam[]>(["teams"], (prevData) => {
        if (!prevData) return prevData;
        return prevData.map((team) =>
          team.id === newTeam.id ? { ...team, ...newTeam } : team,
        );
      });

      const pathname = window.location.pathname;
      const relativePath = pathname
        .split("/dashboard/")[1]
        .split("/")
        .slice(1)
        .join("/");
      router.replace(`/dashboard/${newTeam.slug}/${relativePath}`);

      if (oldSlug && oldTeam && oldSlug !== newTeam.slug) {
        queryClient.removeQueries({ queryKey: ["team", oldSlug] });
        queryClient.setQueryData(["team", newTeam.slug], {
          ...oldTeam,
          ...newTeam,
        });
      } else if (oldSlug) {
        queryClient.setQueryData<UserTeam>(["team", oldSlug], (oldTeam) => {
          if (!oldTeam) return oldTeam;
          return { ...oldTeam, ...newTeam };
        });
      }
    },
  });

  return { createTeam, deleteTeam, renameTeam };
}
