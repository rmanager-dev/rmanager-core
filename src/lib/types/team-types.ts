import { user, team_member, team } from "@/src/db/schema";
import { InferDrizzleSelect } from "../utils";

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
  displayName: team.displayName,
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
