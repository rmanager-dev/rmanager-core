import { user, team_member, team } from "@/src/db/schema";
import { InferDrizzleSelect } from "../utils";
import z from "zod";

export type TeamRole = typeof team_member.$inferSelect.role;

export const TeamMemberSelect = {
  id: user.id,
  email: user.email,
  twoFactorEnabled: user.twoFactorEnabled,
  role: team_member.role,
  joinedAt: team_member.joinedAt,
};
export type TeamMember = InferDrizzleSelect<typeof TeamMemberSelect>;

export const TeamSelect = {
  id: team.id,
  name: team.name,
  slug: team.slug,
  ownerId: team.ownerId,
  createdAt: team.createdAt,
};
export type Team = InferDrizzleSelect<typeof TeamSelect>;

export const UserTeamSelect = {
  ...TeamSelect,
  joinedAt: team_member.joinedAt,
  role: team_member.role,
};
export type UserTeam = InferDrizzleSelect<typeof UserTeamSelect>;


export const CreateTeamSchema = z.object({
  name: z
    .string()
    .min(3, { error: "Team name must be at least 3 characters" })
    .max(32, { error: "Team name must be at most 32 characters" }),
});

export const RenameTeamSchema = z.object({
  name: z
    .string()
    .min(3, { error: "Name must be at least 3 characters" })
    .max(32, { error: "Name must be at most 32 characters" }),
});
