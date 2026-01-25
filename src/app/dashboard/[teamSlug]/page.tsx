"use client";
import { useTeam } from "@/src/hooks/useTeam";

export default function Page() {
  const { data, isLoading } = useTeam();
  if (isLoading) {
    return <span>Loading...</span>;
  }
  
  return <span>{data?.name}</span>;
}
