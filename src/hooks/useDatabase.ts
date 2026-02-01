import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTeam } from "./useTeam";
import {
  DeleteDatabase,
  LinkDatabase,
  ListDatabases,
  RenameDatabase,
} from "../controllers/ExternalDatabaseController";
import { DatabaseInfo } from "../lib/types/database-types";
import { Database } from "../app/dashboard/[teamSlug]/databases/DatabaseColumnOld";
import { useEffect } from "react";
import { hasPermission } from "../lib/utils/team-utils";
import { useRouter } from "next/navigation";

export function useDatabases() {
  const {
    data: team,
    isLoading: isLoadingTeam,
    isError: isErrorTeam,
  } = useTeam();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["databases", team?.id],
    queryFn: () => ListDatabases(team!.id),
    enabled: !!team?.id,
  });

  useEffect(() => {
    if (team && !hasPermission(team.role, "ListDatabases")) {
      router.replace(`/dashboard/${team.slug}/`);
    }
  }, [team]);

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
      LinkDatabase(teamId, data),
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
    }) => DeleteDatabase(teamId, databaseId),
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
    }) => RenameDatabase(teamId, databaseId, newName),
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
