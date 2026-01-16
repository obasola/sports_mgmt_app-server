import type { AccessMeResponse } from "../../domain/types/access.types";
import type { IAccessControlRepository } from "../../domain/repositories/IAccessControlRepository";
import { ForbiddenError, NotFoundError, ValidationError } from "../../domain/access.errors";
import { GetMyAccessContextUseCase } from "./GetMyAccessContextUseCase";

const PUBLIC_RID = 1;

export class AssumeRoleUseCase {
  public constructor(
    private readonly repo: IAccessControlRepository,
    private readonly getMe: GetMyAccessContextUseCase
  ) {}

  public async execute(personId: number, toRid: number): Promise<AccessMeResponse> {
    if (!Number.isFinite(toRid) || toRid <= 0) {
      throw new ValidationError("toRid must be a positive number.");
    }

    const person = await this.repo.getPersonWithActiveRole(personId);
    if (!person) throw new NotFoundError(`Person ${personId} not found.`);

    const fromRid = person.activeRid ?? PUBLIC_RID;

    const assigned = await this.repo.isRoleAssignedToPerson(personId, toRid);
    if (!assigned) throw new ForbiddenError("Requested role is not assigned to this user.");

    const allowed = await this.repo.isAssumeAllowed(fromRid, toRid);
    if (!allowed) throw new ForbiddenError("Role switch is not allowed by RoleAssumeRule.");

    await this.repo.setActiveRole(personId, toRid);

    // Return full refreshed context (client uses this immediately)
    return this.getMe.execute(personId);
  }
}
