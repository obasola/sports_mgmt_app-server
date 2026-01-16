import type { IAccessControlRepository } from "../../domain/repositories/IAccessControlRepository";

export type RevokeRoleFromPersonInput = {
  personId: number;
  roleId: number;
  // adminId?: number; // add later if your schema/audit requires it
};

export class RevokeRoleFromPersonUseCase {
  public constructor(private readonly repo: IAccessControlRepository) {}

  public async execute(input: RevokeRoleFromPersonInput): Promise<void> {
    const { personId, roleId } = input;

    if (!Number.isInteger(personId) || personId <= 0) throw new Error("Invalid personId");
    if (!Number.isInteger(roleId) || roleId <= 0) throw new Error("Invalid roleId");

    await this.repo.revokeRoleFromPerson(personId, roleId);
  }
}
