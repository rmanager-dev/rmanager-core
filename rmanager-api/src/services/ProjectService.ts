import { and, eq } from "drizzle-orm";
import { db } from "@rmanager/shared/db";
import { project } from "@rmanager/shared/db/schema";
import { randomUUID } from "crypto";
import { AccessDenied, ApiError, DatabaseError } from "@rmanager/shared/lib/utils/api-utils";
import { Project, ProjectSelect } from "@rmanager/shared/lib/types/project-types";
import { nameToSlug } from "@rmanager/shared/lib/utils";

const ProjectNotFound = new ApiError(
  404,
  "ProjectNotFound",
  "The requested project was not found",
);
const InvalidProjectName = new ApiError(
  400,
  "InvalidProjectName",
  "The given project name is invalid. Make sure it includes at least 1 character and at most 64 characters",
);
const ProjectSlugTaken = new ApiError(
  409,
  "ProjectSlugTaken",
  "A project with this name already exists in the organization",
);

export const ProjectService = {
  // Private Methods
  ValidateProjectName(name: string) {
    if (name.length < 1 || name.length > 64) {
      throw InvalidProjectName;
    }
  },

  // Public Methods

  async CreateProject(organizationId: string, name: string): Promise<Project> {
    name = name.trim();
    this.ValidateProjectName(name);
    const slug = nameToSlug(name);
    this.ValidateProjectName(slug);

    try {
      const [newProject] = await db
        .insert(project)
        .values({
          id: randomUUID(),
          name,
          slug,
          organizationId,
        })
        .returning(ProjectSelect);
      return newProject;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        throw ProjectSlugTaken;
      }
      throw DatabaseError;
    }
  },

  async DeleteProject(
    organizationId: string,
    projectId: string,
  ): Promise<Project | undefined> {
    try {
      const [result] = await db
        .delete(project)
        .where(
          and(
            eq(project.id, projectId),
            eq(project.organizationId, organizationId),
          ),
        )
        .returning(ProjectSelect);
      if (!result) throw AccessDenied;
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw DatabaseError;
    }
  },

  async RenameProject(
    organizationId: string,
    projectId: string,
    newName: string,
  ): Promise<Project | undefined> {
    newName = newName.trim();
    this.ValidateProjectName(newName);
    const slug = nameToSlug(newName);
    this.ValidateProjectName(slug);

    try {
      const [result] = await db
        .update(project)
        .set({ name: newName, slug })
        .where(
          and(
            eq(project.id, projectId),
            eq(project.organizationId, organizationId),
          ),
        )
        .returning(ProjectSelect);
      if (!result) throw AccessDenied;
      return result;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        throw ProjectSlugTaken;
      }
      throw DatabaseError;
    }
  },

  async GetProject(
    organizationId: string,
    projectId: string,
  ): Promise<Project> {
    let result;
    try {
      [result] = await db
        .select(ProjectSelect)
        .from(project)
        .where(
          and(
            eq(project.id, projectId),
            eq(project.organizationId, organizationId),
          ),
        )
        .limit(1);
    } catch {
      throw DatabaseError;
    }

    if (!result) {
      throw ProjectNotFound;
    }

    return result;
  },

  async GetProjectBySlug(
    organizationId: string,
    projectSlug: string,
  ): Promise<Project> {
    let result;
    try {
      [result] = await db
        .select(ProjectSelect)
        .from(project)
        .where(
          and(
            eq(project.slug, projectSlug),
            eq(project.organizationId, organizationId),
          ),
        )
        .limit(1);
    } catch {
      throw DatabaseError;
    }

    if (!result) {
      throw ProjectNotFound;
    }

    return result;
  },

  async ListOrganizationProjects(organizationId: string): Promise<Project[]> {
    try {
      return await db
        .select(ProjectSelect)
        .from(project)
        .where(eq(project.organizationId, organizationId));
    } catch (error) {
      console.log(error);
      throw DatabaseError;
    }
  },
};
