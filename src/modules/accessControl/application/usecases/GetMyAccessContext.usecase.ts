import { inject, injectable } from "tsyringe";
import type { AccessContext } from "../../domain/access.types";
import type { IAccessControlRepository } from "../../domain/IAccessControlRepository";
import { NotFoundError } from "../../domain/access.errors";

@injectable()
export class GetMyAccessContextUseCase {
  constructor(
    @inject("IAccessControlRepository") private readonly repo: IAccessControlRepository
  ) {}

  public async execute(personId: number): Promise<AccessContext> {
    const person = await this.repo.getPersonWithActiveRole(personId);
    if (!person) throw new NotFoundError(`Person ${personId} not found.`);

    const assignedRoles = await this.repo.getAssignedRoleNames(personId);

    // Ensure there is an active role; default to public if not set
    const activeRoleName = person.activeRoleName ?? "public";
    const activeRid =
      person.activeRid ??
      (await this.repo.getRoleIdByName(activeRoleName)) ??
      (await this.repo.getRoleIdByName("public"));

    if (!activeRid) {
      throw new NotFoundError("No active role is configured and 'public' role could not be found.");
    }

    // If DB has no activeRid yet, set it (one-time stabilization)
    if (person.activeRid === null) {
      await this.repo.setActiveRole(personId, activeRid);
    }

    const permissions = await this.repo.getEffectivePermissionMap(activeRid);

    return {
      person: { personId: person.personId, userName: person.userName },
      roles: { assigned: assignedRoles, active: activeRoleName },
      permissions,
    };
  }
}
