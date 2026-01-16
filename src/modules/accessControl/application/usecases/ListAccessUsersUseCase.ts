import { inject, injectable } from "tsyringe";
import type { ListUsersResponseDto } from "../dtos/AdminAccess.dto";
import type { IAdminAccessRepository } from "../../domain/repositories/IAdminAccessRepository";

export interface ListAccessUsersInput {
  search: string;
}

@injectable()
export class ListAccessUsersUseCase {
  public constructor(
    @inject("IAdminAccessRepository") private readonly repo: IAdminAccessRepository,
  ) {}

  public async execute(input: ListAccessUsersInput): Promise<ListUsersResponseDto> {
    const [users, roles] = await Promise.all([
      this.repo.searchUsers(input.search),
      this.repo.listRoles(),
    ]);

    return { users, roles };
  }
}
