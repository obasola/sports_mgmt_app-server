import type { ActionCode, PermissionMap } from "./access.types";

export interface PersonRow {
  personId: number;
  userName: string;
  activeRid: number | null;
  activeRoleName: string | null;
}

export interface IAccessControlRepository {
  getPersonWithActiveRole(personId: number): Promise<PersonRow | null>;
  getAssignedRoleNames(personId: number): Promise<string[]>;
  getRoleIdByName(roleName: string): Promise<number | null>;

  isRoleAssignedToPerson(personId: number, roleId: number): Promise<boolean>;
  isAssumeAllowed(fromRoleId: number, toRoleId: number): Promise<boolean>;

  setActiveRole(personId: number, roleId: number): Promise<void>;

  getEffectivePermissionMap(roleId: number): Promise<PermissionMap>;

  // Admin ops (UI later)
  grantRoleToPerson(personId: number, roleId: number, assignedByPersonId: number | null): Promise<void>;
  revokeRoleFromPerson(personId: number, roleId: number): Promise<void>;
}
