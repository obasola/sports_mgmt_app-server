import type { AccessMeResponse } from "../../domain/types/access.types";
import type { IAccessControlRepository } from "../../domain/repositories/IAccessControlRepository";
import { NotFoundError } from "../../domain/access.errors";

const PUBLIC_RID = 1;

export class GetMyAccessContextUseCase {
  public constructor(private readonly repo: IAccessControlRepository) {}

  public async execute(personId: number): Promise<AccessMeResponse> {
    const person = await this.repo.getPersonWithActiveRole(personId);
    if (!person) throw new NotFoundError(`Person ${personId} not found.`);

    const assignedRoles = await this.repo.getAssignedRoles(personId);

    // Determine activeRid (stabilize if null)
    const activeRid =
      person.activeRid ??
      (assignedRoles.find((r) => r.rid === PUBLIC_RID)?.rid ?? PUBLIC_RID);

    // If DB has no activeRid yet, set it (one-time stabilization)
    if (person.activeRid === null) {
      await this.repo.setActiveRole(personId, activeRid);
    }

    const activeRoleName =
      person.activeRoleName ??
      assignedRoles.find((r) => r.rid === activeRid)?.roleName ??
      "public";

    const permissions = await this.repo.getEffectivePermissionMap(activeRid);

    return {
      personId: person.personId,
      userName: person.userName,
      activeRid,
      activeRoleName,
      assignedRoles,
      permissions,
    };
  }
}
