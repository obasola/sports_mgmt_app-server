export interface AdminRoleDto {
  rid: number;
  roleName: string;
}

export interface AdminUserDto {
  pid: number;
  userName: string;
  emailAddress: string;
  fullName: string;
  isActive: boolean;
  roles: AdminRoleDto[];
}

export interface ListUsersResponseDto {
  users: AdminUserDto[];
  roles: AdminRoleDto[]; // options for MultiSelect
}
