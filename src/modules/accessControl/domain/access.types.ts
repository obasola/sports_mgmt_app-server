export type ActionCode = "VIEW" | "EDIT" | "CREATE" | "DELETE" | "RUN";

export type PermissionMap = Record<string, ReadonlyArray<ActionCode>>;

export interface AccessContext {
  person: { personId: number; userName: string };
  roles: { assigned: string[]; active: string };
  permissions: PermissionMap;
}
