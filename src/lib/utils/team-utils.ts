import { TeamRole } from "../types/team-types";

export const ROLES_RANK: Record<TeamRole, number> = {
  viewer: 100,
  developer: 200,
  admin: 500,
  owner: 1000,
} as const;

export const TEAM_PERMISSIONS = {
  DeleteTeam: ROLES_RANK.owner,
  TransferOwnership: ROLES_RANK.owner,
  ChangeTeamName: ROLES_RANK.admin,

  ListTeamMembers: ROLES_RANK.viewer,
  RemoveTeamMember: ROLES_RANK.admin,
  UpdateTeamMemberRole: ROLES_RANK.admin,
} as const satisfies Record<string, number>;

export type TeamAction = keyof typeof TEAM_PERMISSIONS;

export const hasPermission = (
  role: TeamRole | undefined,
  action: TeamAction,
): boolean => {
  return role !== undefined && ROLES_RANK[role] >= TEAM_PERMISSIONS[action];
};

export const canManageTarget = (
  actorRole: TeamRole | undefined,
  targetRole: TeamRole,
): boolean => {
  return (
    actorRole !== undefined && ROLES_RANK[actorRole] > ROLES_RANK[targetRole]
  );
};
