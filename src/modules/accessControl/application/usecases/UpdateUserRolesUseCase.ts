import { inject, injectable } from "tsyringe";
import type { AdminUserDto } from "../dtos/AdminAccess.dto";
import type { IAdminAccessRepository } from "../../domain/repositories/IAdminAccessRepository";

export interface UpdateUserRolesInput {
  pid: number;
  roleIds: number[];
}

@injectable()
export class UpdateUserRolesUseCase {
  public constructor(
    @inject("IAdminAccessRepository") private readonly repo: IAdminAccessRepository,
  ) {}

  public async execute(input: UpdateUserRolesInput): Promise<AdminUserDto> {
    const uniqueRoleIds = Array.from(new Set(input.roleIds)).sort((a, b) => a - b);

    await this.repo.setUserRoles(input.pid, uniqueRoleIds);
    const updated = await this.repo.getUserByPid(input.pid);

    return updated;
  }
}
