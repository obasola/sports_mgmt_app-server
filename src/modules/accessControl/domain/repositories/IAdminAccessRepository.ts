import type { AdminRoleDto, AdminUserDto } from "../../application/dtos/AdminAccess.dto";

export interface IAdminAccessRepository {
  searchUsers(search: string): Promise<AdminUserDto[]>;
  listRoles(): Promise<AdminRoleDto[]>;
  setUserRoles(pid: number, roleIds: number[]): Promise<void>;
  getUserByPid(pid: number): Promise<AdminUserDto>;
}
