import type { AccessMeResponse } from "../../domain/types/access.types";
import type { IAccessControlRepository } from "../../domain/repositories/IAccessControlRepository";
import { ForbiddenError, NotFoundError, ValidationError } from "../../domain/access.errors";
import { GetMyAccessContextUseCase } from "./GetMyAccessContextUseCase";

export class SwitchActiveRoleUseCase {
  public constructor(
    private readonly repo: IAccessControlRepository,
    private readonly getContext: GetMyAccessContextUseCase
  ) {}

  public async execute(personId: number, targetRoleName: string): Promise<AccessMeResponse> {
    const trimmed = targetRoleName.trim().toLowerCase();
    if (trimmed.length === 0) throw new ValidationError("roleName is required.");

    const person = await this.repo.getPersonWithActiveRole(personId);
    if (!person) throw new NotFoundError(`Person ${personId} not found.`);
    if (!person.activeRid) throw new ValidationError("Person has no activeRid set.");

    const toRole = await this.repo.getRoleByName(trimmed);
    if (!toRole) throw new NotFoundError(`Role '${trimmed}' not found.`);
    const toRoleId = toRole.rid;

    const assigned = await this.repo.isRoleAssignedToPerson(personId, toRoleId);
    if (!assigned) throw new ForbiddenError(`Role '${trimmed}' is not assigned to this user.`);

    const allowed = await this.repo.isAssumeAllowed(person.activeRid, toRoleId);
    if (!allowed) throw new ForbiddenError(`Not allowed to switch from active role to '${trimmed}'.`);

    await this.repo.setActiveRole(personId, toRoleId);

    return this.getContext.execute(personId);
  }
}
