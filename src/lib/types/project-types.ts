import { project } from "@/src/db/schema";
import { InferDrizzleSelect } from "../utils";
import z from "zod";

export const ProjectSelect = {
  id: project.id,
  name: project.name,
  slug: project.slug,
  organizationId: project.organizationId,
  createdAt: project.createdAt,
};
export type Project = InferDrizzleSelect<typeof ProjectSelect>;

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Project name must be at least 1 character" })
    .max(64, { error: "Project name must be at most 64 characters" }),
});

export const RenameProjectSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Project name must be at least 1 character" })
    .max(64, { error: "Project name must be at most 64 characters" }),
});
