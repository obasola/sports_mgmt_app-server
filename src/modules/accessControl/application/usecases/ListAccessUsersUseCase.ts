import type { ListUsersResponseDto } from "../dtos/AdminAccess.dto";
import type { IAdminAccessRepository } from "../../domain/repositories/IAdminAccessRepository";

export interface ListAccessUsersInput {
  search: string;
}

export class ListAccessUsersUseCase {
  public constructor(private readonly repo: IAdminAccessRepository) {}

  public async execute(input: ListAccessUsersInput): Promise<ListUsersResponseDto> {
    const [users, roles] = await Promise.all([
      this.repo.searchUsers(input.search),
      this.repo.listRoles(),
    ]);

    return { users, roles };
  }
}
