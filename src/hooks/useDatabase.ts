import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTeam } from "./useTeam";
import { Database, DatabaseInfo } from "../lib/types/database-types";
import { useEffect } from "react";
import { hasPermission } from "../lib/utils/team-utils";
import { useRouter } from "next/navigation";
import { ExternalDatabaseController } from "../controllers/ExternalDatabaseController";

export function useDatabases() {
  const {
    data: team,
    isLoading: isLoadingTeam,
    isError: isErrorTeam,
  } = useTeam();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["databases", team?.id],
    queryFn: () => ExternalDatabaseController.list(team!.id),
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

export function useDatabaseMutations() {
  const queryClient = useQueryClient();

  const createDatabase = useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: DatabaseInfo }) =>
      ExternalDatabaseController.link(teamId, data),
    onSuccess: (database, variables) => {
      queryClient.setQueryData<Database[]>(
        ["databases", variables.teamId],
        (prevData) => {
          if (!prevData) return [database];
          return [...prevData, database];
        },
      );
    },
  });

  const deleteDatabase = useMutation({
    mutationFn: ({
      teamId,
      databaseId,
    }: {
      teamId: string;
      databaseId: string;
    }) => ExternalDatabaseController.delete(teamId, databaseId),
    onSuccess: (database, variables) => {
      queryClient.setQueryData<Database[]>(
        ["databases", variables.teamId],
        (prevData) => {
          if (!prevData) return prevData;
          return prevData.filter((db) => db.id !== database.id);
        },
      );
    },
  });

  const renameDatabase = useMutation({
    mutationFn: ({
      teamId,
      databaseId,
      newName,
    }: {
      teamId: string;
      databaseId: string;
      newName: string;
    }) => ExternalDatabaseController.rename(teamId, databaseId, newName),
    onSuccess: (database, variables) => {
      queryClient.setQueryData<Database[]>(
        ["databases", variables.teamId],
        (prevData) => {
          if (!prevData) return [database];
          return prevData.map((db) => (db.id === database.id ? database : db));
        },
      );
    },
  });

  return {
    createDatabase,
    deleteDatabase,
    renameDatabase,
  };
}
