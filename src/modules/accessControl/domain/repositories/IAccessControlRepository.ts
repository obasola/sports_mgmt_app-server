import type { PermissionMap, AssignedRole } from "../types/access.types";
import type { PermissionTuple } from "../types/access.types";

export interface PersonRow {
  personId: number;
  userName: string;
  activeRid: number | null;
  activeRoleName: string | null;
}

export interface IAccessControlRepository {
  getPersonWithActiveRole(personId: number): Promise<PersonRow | null>;
  getAssignedRoles(personId: number): Promise<AssignedRole[]>;
  getRoleByName(roleName: string): Promise<AssignedRole | null>
  isRoleAssignedToPerson(personId: number, roleId: number): Promise<boolean>;
  isAssumeAllowed(fromRoleId: number, toRoleId: number): Promise<boolean>;
  revokeRoleFromPerson(personId: number, roleId: number): Promise<void>;
  setActiveRole(personId: number, roleId: number): Promise<void>;
  grantRoleToPerson(personId: number,roleId: number,grantedByPersonId: number): Promise<void>;
  /**
   * Must return effective permission map. If you already have a DB view that
   * implements "EDIT implies VIEW", use it here. If not, repo may implement it.
   */
  getEffectivePermissionMap(roleId: number): Promise<PermissionMap>;

  getRoleIdByName(roleNameLower: string): Promise<number | null>;
  getRoleIdsForPerson(personId: number): Promise<number[]>;
  getPermissionsForRoleIds(roleIds: number[]): Promise<PermissionTuple[]>;

  grantRoleToPerson(personId: number, roleId: number, grantedByPersonId: number): Promise<void>;
  revokeRoleFromPerson(personId: number, roleId: number): Promise<void>;

  canAssumeRole(fromRoleId: number, toRoleId: number): Promise<boolean>;
}
