"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ResolveTeamBySlug } from "../controllers/TeamController";
import { useEffect } from "react";

export function useTeam() {
  const { teamSlug } = useParams();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["teams", teamSlug],
    queryFn: () => ResolveTeamBySlug(teamSlug as string),
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
