import type { ActionCode } from "../../domain/types/AccessTypes";

export type AccessMeResponseDTO = {
  personId: number;
  userName: string;

  activeRid: number;
  activeRoleName: string;

  assignedRoles: { rid: number; roleName: string }[];

  permissions: Record<string, ActionCode[]>;
};

export type AssumeRoleRequestDTO = {
  toRid: number;
};
