import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, DatabaseInfo } from "@rmanager/shared/lib/types/database-types";
import { useRouter } from "next/navigation";
import { ExternalDatabaseController } from "@/src/controllers/ExternalDatabaseController";
import { useOrg } from "./useOrg";

export function useDatabases() {
  const { data: org, isLoading: isOrgLoading, isError: isErrorOrg } = useOrg();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["databases", org?.id],
    queryFn: () => ExternalDatabaseController.list(org!.id),
    enabled: !!org?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isOrgLoading || query.isLoading;
  const isError = isErrorOrg || query.isError;

  return {
    ...query,
    isLoading,
    isError,
  };
}

export function useDatabaseMutations() {
  const queryClient = useQueryClient();

  const createDatabase = useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: DatabaseInfo }) =>
      ExternalDatabaseController.link(orgId, data),
    onSuccess: (database, variables) => {
      queryClient.setQueryData<Database[]>(
        ["databases", variables.orgId],
        (prevData) => {
          if (!prevData) return [database];
          return [...prevData, database];
        },
      );
    },
  });

  const deleteDatabase = useMutation({
    mutationFn: ({
      orgId,
      databaseId,
    }: {
      orgId: string;
      databaseId: string;
    }) => ExternalDatabaseController.delete(orgId, databaseId),
    onSuccess: (database, variables) => {
      queryClient.setQueryData<Database[]>(
        ["databases", variables.orgId],
        (prevData) => {
          if (!prevData) return prevData;
          return prevData.filter((db) => db.id !== database.id);
        },
      );
    },
  });

  const renameDatabase = useMutation({
    mutationFn: ({
      orgId,
      databaseId,
      newName,
    }: {
      orgId: string;
      databaseId: string;
      newName: string;
    }) => ExternalDatabaseController.rename(orgId, databaseId, newName),
    onSuccess: (database, variables) => {
      queryClient.setQueryData<Database[]>(
        ["databases", variables.orgId],
        (prevData) => {
          if (!prevData) return [database];
          return prevData.map((db) => (db.id === database.id ? database : db));
        },
      );
    },
  });

  const refreshDatabase = useMutation({
    mutationFn: ({
      orgId,
      databaseId,
    }: {
      orgId: string;
      databaseId: string;
    }) => ExternalDatabaseController.refresh(orgId, databaseId),
    onSuccess: (database, variables) => {
      queryClient.setQueryData<Database[]>(
        ["databases", variables.orgId],
        (prevData) => {
          if (!prevData) return [database];
          return prevData.map((db) => (db.id === database.id ? database : db));
        },
      );
    },
  });

  const rotateDatabase = useMutation({
    mutationFn: ({
      orgId,
      databaseId,
      accessKey,
      secretKey,
    }: {
      orgId: string;
      databaseId: string;
      accessKey: string;
      secretKey: string;
    }) =>
      ExternalDatabaseController.rotate(
        orgId,
        databaseId,
        accessKey,
        secretKey,
      ),
    onSuccess: (database, variables) => {
      queryClient.setQueryData<Database[]>(
        ["databases", variables.orgId],
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
    refreshDatabase,
    rotateDatabase,
  };
}
