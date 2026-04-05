import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { project } from "../db/schema";
import { randomUUID } from "crypto";
import { AccessDenied, ApiError, DatabaseError } from "../lib/utils/api-utils";
import { Project, ProjectSelect } from "../lib/types/project-types";
import { TeamService } from "./TeamService";
import { hasPermission } from "../lib/utils/team-utils";
import { nameToSlug } from "../lib/utils";

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
  "A project with this name already exist in the team",
);

export const ProjectService = {
  // Private Methods
  ValidateProjectName(name: string) {
    if (name.length < 1 || name.length > 64) {
      throw InvalidProjectName;
    }
  },

  // Public Methods

  async CreateProject(
    actorId: string,
    teamId: string,
    name: string,
  ): Promise<Project> {
    const role = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(role, "CreateProject")) {
      throw AccessDenied;
    }

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
          teamId,
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
    actorId: string,
    teamId: string,
    projectId: string,
  ): Promise<Project | undefined> {
    const role = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(role, "DeleteProject")) {
      throw AccessDenied;
    }

    try {
      const [result] = await db
        .delete(project)
        .where(and(eq(project.id, projectId), eq(project.teamId, teamId)))
        .returning(ProjectSelect);
      return result;
    } catch {
      throw DatabaseError;
    }
  },

  async RenameProject(
    actorId: string,
    teamId: string,
    projectId: string,
    newName: string,
  ): Promise<Project | undefined> {
    const role = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(role, "RenameProject")) {
      throw AccessDenied;
    }

    newName = newName.trim();
    this.ValidateProjectName(newName);
    const slug = nameToSlug(newName);
    this.ValidateProjectName(slug);

    try {
      const [result] = await db
        .update(project)
        .set({ name: newName, slug })
        .where(and(eq(project.id, projectId), eq(project.teamId, teamId)))
        .returning(ProjectSelect);
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
    actorId: string,
    teamId: string,
    projectId: string,
  ): Promise<Project> {
    const role = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(role, "ListProjects")) {
      throw AccessDenied;
    }

    let result;
    try {
      [result] = await db
        .select(ProjectSelect)
        .from(project)
        .where(and(eq(project.id, projectId), eq(project.teamId, teamId)))
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
    actorId: string,
    teamId: string,
    projectSlug: string,
  ): Promise<Project> {
    const role = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(role, "ListProjects")) {
      throw AccessDenied;
    }

    let result;
    try {
      [result] = await db
        .select(ProjectSelect)
        .from(project)
        .where(and(eq(project.slug, projectSlug), eq(project.teamId, teamId)))
        .limit(1);
    } catch {
      throw DatabaseError;
    }

    if (!result) {
      throw ProjectNotFound;
    }

    return result;
  },

  async ListTeamProjects(actorId: string, teamId: string): Promise<Project[]> {
    const role = await TeamService.GetTeamUserRole(actorId, teamId);
    if (!hasPermission(role, "ListProjects")) {
      throw AccessDenied;
    }

    try {
      return await db
        .select(ProjectSelect)
        .from(project)
        .where(eq(project.teamId, teamId));
    } catch {
      throw DatabaseError;
    }
  },
};
