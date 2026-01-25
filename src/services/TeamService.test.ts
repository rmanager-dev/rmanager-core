import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/src/db";
import { TeamService } from "./TeamService";
import { team_member, user } from "../db/schema";
import { and, eq, sql } from "drizzle-orm";
import { UserNotFound } from "../lib/utils/errors";
import { TeamRole } from "../lib/utils/team-utils";

async function createUser(name: string) {
  await db.insert(user).values({
    id: name,
    name: name,
    email: `${name}.rmanager@gmail.com`,
  });
}

async function addUserToTeam(user: string, teamId: string, role: TeamRole) {
  await db.insert(team_member).values({ userId: user, teamId, role });
}

describe("TeamService", async () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
  });

  describe("Global Service Error Handling", () => {
    const user1 = "user-123";
    beforeEach(() => {
      createUser(user1);
      vi.spyOn(db, "transaction").mockRejectedValue(
        new Error("Database Offline"),
      );
      vi.spyOn(db, "select").mockRejectedValue(new Error("Database Offline"));
    });

    it.each([
      ["CreateTeam", () => TeamService.CreateTeam(user1, "")],
      ["GetTeamUserRole", () => TeamService.GetTeamUserRole(user1, "")],
      ["ListUserTeams", () => TeamService.ListUserTeams(user1)],
    ])(
      "should handle database failure gracefully in %s",
      async (_, methodCall) => {
        await expect(methodCall()).rejects.toThrow();
      },
    );
  });

  describe("CreateTeam", () => {
    it("should fail if the user doesn't exist", async () => {
      await expect(
        TeamService.CreateTeam("uknown-user", "Acme Corp"),
      ).rejects.toThrow(UserNotFound);
    });

    it("should fail if the name is too small", async () => {
      const user1 = "user-123";
      await createUser(user1);

      await expect(TeamService.CreateTeam(user1, "")).rejects.toThrow();
    });

    it("should create a team with the target user as owner", async () => {
      const name = "Acme Corp";
      const user = "user-123";
      await createUser(user);

      const result = await TeamService.CreateTeam(user, name);

      expect(result).toBeDefined();
      expect(result.name).toBe(name);
      expect(result.slug).toMatch(/acme-corp-.+/);

      const [member] = await db
        .select()
        .from(team_member)
        .where(
          and(eq(team_member.teamId, result.id), eq(team_member.userId, user)),
        );

      expect(member.role).toBe("owner");
    });

    it("should retry if there was a slug collision", async () => {
      const user = "user-123";
      await createUser(user);

      const SlugSpy = vi.spyOn(TeamService, "CreateSlugFromName");

      const result = await TeamService.CreateTeam(user, "Acme Corp"); // Create a team and retrieve its slug
      expect(SlugSpy).toHaveBeenCalledWith("Acme Corp");

      SlugSpy.mockReturnValueOnce(result.slug); // Create a collision once by using the last team's slug
      await TeamService.CreateTeam(user, "Acme Corp");
      expect(SlugSpy).toBeCalledTimes(3);

      SlugSpy.mockReturnValue(result.slug); // Create constant collision
      await expect(TeamService.CreateTeam(user, "Acme Corp")).rejects.toThrow();
    });
  });

  describe("DeleteTeam", () => {
    it("should succeed if the actor is the owner", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");

      await expect(
        TeamService.DeleteTeam(user1, team.id),
      ).resolves.not.toThrow();
    });

    it("should fail if the actor is not the owner", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const user2 = "user-2";
      await createUser(user2);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");
      await addUserToTeam(user2, team.id, "admin");

      await expect(TeamService.DeleteTeam(user2, team.id)).rejects.toThrow();
    });
  });

  describe("TransferOwnership", () => {
    it("should succeed if the actor is the owner", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const user2 = "user-2";
      await createUser(user2);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");
      await addUserToTeam(user2, team.id, "viewer");

      await expect(
        TeamService.TransferOwnership(user1, user2, team.id),
      ).resolves.not.toThrow();
    });

    it("should fail if the actor is not the owner", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const user2 = "user-2";
      await createUser(user2);

      const user3 = "user-3";
      await createUser(user3);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");
      addUserToTeam(user2, team.id, "admin");
      addUserToTeam(user3, team.id, "admin");

      await expect(
        TeamService.TransferOwnership(user2, user3, team.id),
      ).rejects.toThrow();
    });

    it("should fail if the owner tries to transfer to himself", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");

      await expect(
        TeamService.TransferOwnership(user1, user1, team.id),
      ).rejects.toThrow();
    });

    it("should fail if the target is not in the team", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const user2 = "user-2";
      await createUser(user2);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");

      await expect(
        TeamService.TransferOwnership(user1, user2, team.id),
      ).rejects.toThrow();
    });
  });

  describe("ChangeTeamName", () => {
    it("should correctly change the team data if the actor is admin or higher", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const user2 = "user-2";
      await createUser(user2);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");
      addUserToTeam(user2, team.id, "admin");
      const newData = await TeamService.ChangeTeamName(user2, team.id, {
        name: "New Team",
        displayName: "New Team!",
      });

      expect(newData).toEqual(
        expect.objectContaining({ name: "New Team", displayName: "New Team!" }),
      );

      expect(newData?.slug).toContain("new-team");
    });

    it("should error if the new name is too small", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");

      await expect(
        TeamService.ChangeTeamName(user1, team.id, {
          name: "A",
          displayName: "A",
        }),
      ).rejects.toThrow();
    });

    it("should error if the actor is not admin or higher", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const user2 = "user-2";
      await createUser(user2);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");
      addUserToTeam(user2, team.id, "developer");

      await expect(
        TeamService.ChangeTeamName(user2, team.id, { name: "New Name" }),
      ).rejects.toThrow();
    });
  });

  describe("ListTeamMembers", () => {
    it("should fail if the actor is not in the team", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const user2 = "user-2";
      await createUser(user2);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");

      await expect(
        TeamService.ListTeamMembers(user2, team.id),
      ).rejects.toThrow();
    });

    it("should correctly return the members in a team", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const user2 = "user-2";
      await createUser(user2);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");
      addUserToTeam(user2, team.id, "viewer");

      await expect(
        TeamService.ListTeamMembers(user2, team.id),
      ).resolves.toHaveLength(2);
    });
  });

  describe("RemoveTeamMember", () => {
    it("should succeed if the actor has a higher rank than admin and the target rank", async () => {
      const user1 = "user-123";
      await createUser(user1);
      const user2 = "user-2";
      await createUser(user2);
      const user3 = "user-3";
      await createUser(user3);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");
      addUserToTeam(user2, team.id, "admin");
      addUserToTeam(user3, team.id, "developer");

      await expect(
        TeamService.RemoveTeamMember(user2, user3, team.id),
      ).resolves.not.toThrow();

      await expect(
        TeamService.RemoveTeamMember(user1, user2, team.id),
      ).resolves.not.toThrow();

      await expect(
        db.select().from(team_member).where(eq(team_member.teamId, team.id)),
      ).resolves.toHaveLength(1);
    });

    it("should error if the actor is lower rank than admin or the target rank", async () => {
      const user1 = "user-123";
      await createUser(user1);
      const user2 = "user-2";
      await createUser(user2);
      const user3 = "user-3";
      await createUser(user3);
      const user4 = "user-4";
      await createUser(user4);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");
      addUserToTeam(user2, team.id, "admin");
      addUserToTeam(user3, team.id, "developer");
      addUserToTeam(user4, team.id, "admin");

      await expect(
        TeamService.RemoveTeamMember(user3, user2, team.id),
      ).rejects.toThrow();
      await expect(
        TeamService.RemoveTeamMember(user2, user4, team.id),
      ).rejects.toThrow();
      await expect(
        TeamService.RemoveTeamMember(user2, user1, team.id),
      ).rejects.toThrow();

      await expect(
        db.select().from(team_member).where(eq(team_member.teamId, team.id)),
      ).resolves.toHaveLength(4);
    });

    it("should succeed if removing self while not being the owner", async () => {
      const user1 = "user-123";
      await createUser(user1);
      const user2 = "user-2";
      await createUser(user2);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");
      addUserToTeam(user2, team.id, "admin");

      await expect(
        TeamService.RemoveTeamMember(user2, user2, team.id),
      ).resolves.not.toThrow();

      await expect(
        TeamService.RemoveTeamMember(user1, user1, team.id),
      ).rejects.toThrow();
    });
  });

  describe("UpdateTeamMemberRole", () => {
    it("should succeed if the actor has a higher rank than admin, the target rank and the new rank", async () => {
      const user1 = "user-123";
      await createUser(user1);
      const user2 = "user-2";
      await createUser(user2);
      const user3 = "user-3";
      await createUser(user3);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");
      addUserToTeam(user2, team.id, "admin");
      addUserToTeam(user3, team.id, "developer");

      await expect(
        TeamService.UpdateTeamMemberRole(user2, user3, team.id, "viewer"),
      ).resolves.not.toThrow();

      await expect(
        TeamService.UpdateTeamMemberRole(user1, user2, team.id, "developer"),
      ).resolves.not.toThrow();
    });

    it("should error if the actor is lower rank than admin or the target rank", async () => {
      const user1 = "user-123";
      await createUser(user1);
      const user2 = "user-2";
      await createUser(user2);
      const user3 = "user-3";
      await createUser(user3);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");
      addUserToTeam(user2, team.id, "admin");
      addUserToTeam(user3, team.id, "developer");

      await expect(
        TeamService.UpdateTeamMemberRole(user3, user2, team.id, "viewer"),
      ).rejects.toThrow();
      await expect(
        TeamService.UpdateTeamMemberRole(user2, user1, team.id, "viewer"),
      ).rejects.toThrow();
      await expect(
        TeamService.UpdateTeamMemberRole(user2, user3, team.id, "admin"),
      ).rejects.toThrow();
      await TeamService.UpdateTeamMemberRole(user1, user3, team.id, "admin");
      await expect(
        TeamService.UpdateTeamMemberRole(user2, user3, team.id, "viewer"),
      ).rejects.toThrow();
    });

    it("should fail if the owner tries to change it's role", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");

      await expect(
        TeamService.UpdateTeamMemberRole(user1, user1, team.id, "admin"),
      ).rejects.toThrow();
    });

    it("should fail if trying to set an invalid role", async () => {
      const user1 = "user-123";
      await createUser(user1);
      const user2 = "user-2";
      await createUser(user2);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");
      addUserToTeam(user2, team.id, "admin");

      await expect(
        TeamService.UpdateTeamMemberRole(
          user1,
          user2,
          team.id,
          "InvalidRole" as TeamRole,
        ),
      ).rejects.toThrow();
    });
  });

  describe("ListUserTeams", async () => {
    it("should correctly list a user's teams", async () => {
      const user1 = "user-123";
      await createUser(user1);

      await TeamService.CreateTeam(user1, "Acme Corp");
      await TeamService.CreateTeam(user1, "Acme Corp");
      await TeamService.CreateTeam(user1, "Acme Corp");

      await expect(TeamService.ListUserTeams(user1)).resolves.toHaveLength(3);
    });

    it("should error if the user doesn't exist", async () => {
      await expect(TeamService.ListUserTeams("unknown-user")).rejects.toThrow();
    });
  });

  describe("GetTeamBySlug", async () => {
    it("should fail if the user is not in the team", async () => {
      const user1 = "user-123";
      await createUser(user1);
      const user2 = "user-2";
      await createUser(user2);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");

      await expect(
        TeamService.GetTeamBySlug(user2, team.slug),
      ).rejects.toThrow();
    });

    it("should return the team correctly", async () => {
      const user1 = "user-123";
      await createUser(user1);

      const team = await TeamService.CreateTeam(user1, "Acme Corp");

      expect(await TeamService.GetTeamBySlug(user1, team.slug)).toEqual(
        expect.objectContaining({ id: team.id }),
      );
    });
  });
});
