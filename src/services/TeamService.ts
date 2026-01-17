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
import { string } from "zod";
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
  "Taret user was not found in the team",
);
const OwnerRemovalRestricted = new ApiError(
  409,
  "OwnerRemovalRestrictedc",
  "You are the sole owner of this team. You must transfer ownership to another member or delete the team entirely before leaving",
);

export const TeamService = {
  // Private Methods
  async CreateSlugFromName(name: string) {
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "") // Remove special characters
      .split(/\s+/) // Remove white spaces
      .join("-"); // Join the words with a dash

    return cleanName + "-" + GetUUID(8);
  },

  async GetTeamUserRole(targetId: string, teamId: string) {
    if (!(await CheckUserExist(targetId))) {
      throw UserNotFound;
    }

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

  async CreateTeam(actorId: string, teamName: string) {
    if (!(await CheckUserExist(actorId))) {
      throw UserNotFound;
    }

    for (let i = 0; i < 3; i++) {
      const slug = await this.CreateSlugFromName(teamName);
      const teamId = randomUUID();

      try {
        const result = await db.transaction(async (tx) => {
          const [newTeam] = await tx
            .insert(team)
            .values({
              id: teamId,
              name: teamName,
              slug,
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
    if (targetRole === "owner") throw OwnerRemovalRestricted;

    const isSelf = actorId === targetId;
    const isOwner = actorRole === "owner";
    const isAdminKickingLower = actorRole === "admin" && targetRole !== "admin";

    if (isSelf || isOwner || isAdminKickingLower) {
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
