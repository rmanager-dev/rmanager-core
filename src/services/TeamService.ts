import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { team } from "../db/schema/team";
import { GetUUID } from "../lib/crypto/uuid";
import {
  AccessDenied,
  ApiError,
  DatabaseError,
  UserNotFound,
} from "../lib/utils/errors";
import { randomUUID } from "crypto";
import { team_member } from "../db/schema/team_member";
import { CheckUserExist } from "../lib/utils/auth-utils";
import { user } from "../db/schema";

const InvalidSlug = new ApiError(
  409,
  "InvalidTeamSlug",
  "We couldn't generate a unique URL for your team. Please try again.",
);
const InvalidName = new ApiError(
  400,
  "InvalidTeamName",
  "The given team name is invalid. Make sure it includes at least 3 characters",
);
const MemberNotFound = new ApiError(
  404,
  "MemberNotFound",
  "Target user was not found in the team",
);
const OwnerRemovalRestricted = new ApiError(
  409,
  "OwnerRemovalRestrictedc",
  "You are the sole owner of this team. You must transfer ownership to another member or delete the team entirely before leaving",
);
const CantSelfTransferOwnership = new ApiError(
  409,
  "CantSelfTransferOwnership",
  "You can't transfer the team ownership to yourself!",
);

const CantSelfUpdateRole = new ApiError(
  409,
  "CantSelfUpdateRole",
  "You can't change your own role in the team!",
);
const UseTransferOwnership = new ApiError(
  400,
  "UseTransferOwnership",
  "To make a member the new owner of the team, please use the dedicated transfer ownership tool.",
);

type TeamRole = typeof team_member.$inferSelect.role;

export const TeamService = {
  // Private Methods
  CreateSlugFromName(name: string) {
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters
      .split(/\s+/) // Remove white spaces
      .join("-"); // Join the words with a dash

    if (cleanName.length < 3) {
      throw InvalidName;
    }

    return cleanName + "-" + GetUUID(8);
  },

  async GetTeamUserRole(targetId: string, teamId: string) {
    try {
      const [result] = await db
        .select({
          role: team_member.role,
        })
        .from(team_member)
        .where(
          and(eq(team_member.userId, targetId), eq(team_member.teamId, teamId)),
        )
        .limit(1);

      return result ? result.role : null;
    } catch {
      throw DatabaseError;
    }
  },

  // Public Methods

  // Team

  async CreateTeam(actorId: string, teamName: string) {
    if (!(await CheckUserExist(actorId))) {
      throw UserNotFound;
    }

    for (let i = 0; i < 3; i++) {
      const slug = this.CreateSlugFromName(teamName);
      const teamId = randomUUID();

      try {
        const result = await db.transaction(async (tx) => {
          const [newTeam] = await tx
            .insert(team)
            .values({
              id: teamId,
              name: teamName,
              displayName: teamName,
              slug,
              ownerId: actorId,
            })
            .returning({
              id: team.id,
              name: team.name,
              slug: team.slug,
              createdAt: team.createdAt,
            });

          await tx.insert(team_member).values({
            userId: actorId,
            teamId,
            role: "owner",
          });

          return newTeam;
        });

        return result;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("SQLITE_CONSTRAINT_UNIQUE")) {
            // Slug collision
            continue;
          }
        }
        throw DatabaseError;
      }
    }
    throw InvalidSlug;
  },

  async DeleteTeam(actorId: string, teamId: string) {
    const role = await this.GetTeamUserRole(actorId, teamId);
    if (role !== "owner") {
      throw AccessDenied;
    }

    try {
      await db.delete(team).where(eq(team.id, teamId));
    } catch {
      throw DatabaseError;
    }
  },

  async TransferOwnership(actorId: string, targetId: string, teamId: string) {
    const actorRole = await this.GetTeamUserRole(actorId, teamId);
    if (actorRole !== "owner") {
      throw AccessDenied;
    }

    if (actorId === targetId) {
      throw CantSelfTransferOwnership;
    }

    const targetRole = await this.GetTeamUserRole(targetId, teamId);
    if (!targetRole) {
      throw MemberNotFound;
    }

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(team)
          .set({ ownerId: targetId })
          .where(eq(team.id, teamId));
        await tx
          .update(team_member)
          .set({ role: "admin" })
          .where(
            and(
              eq(team_member.teamId, teamId),
              eq(team_member.userId, actorId),
            ),
          );
        await tx
          .update(team_member)
          .set({ role: "owner" })
          .where(
            and(
              eq(team_member.teamId, teamId),
              eq(team_member.userId, targetId),
            ),
          );
      });
    } catch {
      throw DatabaseError;
    }
  },

  async ChangeTeamName(
    actorId: string,
    teamId: string,
    newName: { displayName?: string; name?: string },
  ) {
    const role = await this.GetTeamUserRole(actorId, teamId);

    if (role !== "owner" && role !== "admin") {
      throw AccessDenied;
    }

    const updatePayload: Partial<typeof team.$inferInsert> = {};

    if (newName.displayName) {
      updatePayload.displayName = newName.displayName;
    }

    if (newName.name) {
      updatePayload.name = newName.name;
    }

    if (Object.keys(updatePayload).length < 1) {
      return;
    }

    for (let i = 0; i < 3; i++) {
      if (updatePayload.name) {
        updatePayload.slug = this.CreateSlugFromName(updatePayload.name);
      }
      try {
        const [result] = await db
          .update(team)
          .set(updatePayload)
          .where(eq(team.id, teamId))
          .returning({
            name: team.name,
            displayName: team.displayName,
            slug: team.slug,
          });
        return result;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("SQLITE_CONSTRAINT_UNIQUE")) {
            continue;
          }
        }
        throw DatabaseError;
      }
    }
  },

  // Members

  async ListTeamMembers(actorId: string, teamId: string) {
    const role = await this.GetTeamUserRole(actorId, teamId);
    if (!role) {
      throw AccessDenied;
    }

    try {
      const result = await db
        .select({
          email: user.email,
          twoFactorEnabled: user.twoFactorEnabled,
          role: team_member.role,
          joinedAt: team_member.joinedAt,
        })
        .from(team_member)
        .innerJoin(user, eq(user.id, team_member.userId))
        .where(eq(team_member.teamId, teamId));

      return result;
    } catch {
      throw DatabaseError;
    }
  },

  async RemoveTeamMember(actorId: string, targetId: string, teamId: string) {
    const actorRole = await this.GetTeamUserRole(actorId, teamId);
    const targetRole = await this.GetTeamUserRole(targetId, teamId);

    if (!actorRole) throw AccessDenied;
    if (!targetRole) throw MemberNotFound;

    const isSelf = actorId === targetId;
    const isOwner = actorRole === "owner";
    const isAdminKickingLower = actorRole === "admin" && targetRole !== "admin";

    if (isSelf || isOwner || isAdminKickingLower) {
      if (targetRole === "owner") throw OwnerRemovalRestricted;
      try {
        await db
          .delete(team_member)
          .where(
            and(
              eq(team_member.userId, targetId),
              eq(team_member.teamId, teamId),
            ),
          );
        return;
      } catch {
        throw DatabaseError;
      }
    } else {
      throw AccessDenied;
    }
  },

  async UpdateTeamMemberRole(
    actorId: string,
    targetId: string,
    teamId: string,
    newRole: TeamRole,
  ) {
    const actorRole = await this.GetTeamUserRole(actorId, teamId);
    const targetRole = await this.GetTeamUserRole(targetId, teamId);

    if (!targetRole) {
      throw MemberNotFound;
    }

    if (actorId === targetId) {
      throw CantSelfUpdateRole;
    }

    if (newRole === "owner") {
      throw UseTransferOwnership;
    }

    const isOwner = actorRole === "owner";
    const isAdminEditingLower =
      actorRole === "admin" && // Is Admin
      targetRole !== "admin" && // Acting on lower role
      targetRole !== "owner" && // Acting on lower role
      newRole !== "admin"; // Not making new admins

    if (isOwner || isAdminEditingLower) {
      try {
        await db
          .update(team_member)
          .set({ role: newRole })
          .where(
            and(
              eq(team_member.teamId, teamId),
              eq(team_member.userId, targetId),
            ),
          );
      } catch {
        throw DatabaseError;
      }
    } else {
      throw AccessDenied;
    }
  },

  // User

  async ListUserTeams(actorId: string) {
    if (!(await CheckUserExist(actorId))) {
      throw UserNotFound;
    }

    try {
      const result = await db
        .select({
          id: team.id,
          name: team.name,
          slug: team.slug,
          createdAt: team.createdAt,
        })
        .from(team_member)
        .innerJoin(team, eq(team_member.teamId, team.id))
        .where(eq(team_member.userId, actorId));

      return result;
    } catch {
      throw DatabaseError;
    }
  },
};
