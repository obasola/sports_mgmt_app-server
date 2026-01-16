export type ActionCode = "VIEW" | "EDIT" | "CREATE" | "DELETE" | "RUN";

/**
 * Keep server permissive: domains are DB-driven (FeatureDomain.domainCode).
 * Client can keep a stricter union if you want.
 */
export interface PermissionTuple {
  domain: string;
  action: string;
}
export type DomainCode = string;

export type PermissionMap = Record<DomainCode, readonly ActionCode[]>;

export type AssignedRole = {
  rid: number;
  roleName: string;
};

export type AccessMeResponse = {
  personId: number;
  userName: string;

  activeRid: number;
  activeRoleName: string;

  assignedRoles: AssignedRole[];

  // effective perms (already includes implied VIEW)
  permissions: PermissionMap;
};
