import { inject, injectable } from "tsyringe";
import type { AccessContext } from "../../domain/access.types";
import type { IAccessControlRepository } from "../../domain/IAccessControlRepository";
import { ForbiddenError, NotFoundError, ValidationError } from "../../domain/access.errors";
import { GetMyAccessContextUseCase } from "./GetMyAccessContext.usecase";

@injectable()
export class SwitchActiveRoleUseCase {
  constructor(
    @inject("IAccessControlRepository") private readonly repo: IAccessControlRepository,
    private readonly getContext: GetMyAccessContextUseCase
  ) {}

  public async execute(personId: number, targetRoleName: string): Promise<AccessContext> {
    const trimmed = targetRoleName.trim().toLowerCase();
    if (trimmed.length === 0) throw new ValidationError("roleName is required.");

    const person = await this.repo.getPersonWithActiveRole(personId);
    if (!person) throw new NotFoundError(`Person ${personId} not found.`);
    if (!person.activeRid) throw new ValidationError("Person has no activeRid set.");

    const toRoleId = await this.repo.getRoleIdByName(trimmed);
    if (!toRoleId) throw new NotFoundError(`Role '${trimmed}' not found.`);

    const assigned = await this.repo.isRoleAssignedToPerson(personId, toRoleId);
    if (!assigned) throw new ForbiddenError(`Role '${trimmed}' is not assigned to this user.`);

    const allowed = await this.repo.isAssumeAllowed(person.activeRid, toRoleId);
    if (!allowed) {
      throw new ForbiddenError(`Not allowed to switch from active role to '${trimmed}'.`);
    }

    await this.repo.setActiveRole(personId, toRoleId);

    return this.getContext.execute(personId);
  }
}
