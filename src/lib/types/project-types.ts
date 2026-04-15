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

export const ProjectNameSchema = z.object({
  name: z
    .string()
    .min(3, { error: "Project name must be at least 3 characters" })
    .max(64, { error: "Project name must be at most 64 characters" }),
});

export const CreateProjectSchema = ProjectNameSchema;
export const RenameProjectSchema = ProjectNameSchema;
