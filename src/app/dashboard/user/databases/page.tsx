"use client";
import { ListDatabases } from "@/src/controllers/ExternalDatabaseController";
import { columns } from "./DatabaseColumn";
import { DatabaseTable } from "./DatabaseTable";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["databases"],
    queryFn: ListDatabases,
    staleTime: 5 * 60 * 1000,
  });
  return (
    <>
      <div className="flex flex-col w-full">
        <span className="w-full text-left text-lg font-semibold">
          Databases
        </span>
        <span className="w-full text-left text-sm font-light">
          Link external databases to your account to use in your projects
        </span>
      </div>
      <div className="container mx-auto">
        <DatabaseTable
          columns={columns}
          data={data ?? []}
          loading={isLoading}
          refreshFn={refetch}
        />
      </div>
    </>
  );
}
