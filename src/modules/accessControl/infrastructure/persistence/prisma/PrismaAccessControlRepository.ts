import { Prisma, PrismaClient } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import type { ActionCode, PermissionMap } from "../../../domain/access.types";
import type { IAccessControlRepository, PersonRow } from "../../../domain/IAccessControlRepository";

type ViewRow = { domainCode: string; actionCode: string };
type PersonActiveRow = { personId: number; userName: string; activeRid: number | null; activeRoleName: string | null };
type RoleNameRow = { roleName: string };
type RoleIdRow = { rid: number };
type ExistsRow = { ok: number };

@injectable()
export class PrismaAccessControlRepository implements IAccessControlRepository {
  constructor(@inject("PrismaClient") private readonly prisma: PrismaClient) {}

  public async getPersonWithActiveRole(personId: number): Promise<PersonRow | null> {
    const rows = await this.prisma.$queryRaw<PersonActiveRow[]>(
      Prisma.sql`
        SELECT
          p.pid AS personId,
          p.userName AS userName,
          p.activeRid AS activeRid,
          r.roleName AS activeRoleName
        FROM Person p
        LEFT JOIN Roles r ON r.rid = p.activeRid
        WHERE p.pid = ${personId}
        LIMIT 1
      `
    );
    return rows.length === 1 ? rows[0] : null;
  }

  public async getAssignedRoleNames(personId: number): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<RoleNameRow[]>(
      Prisma.sql`
        SELECT r.roleName
        FROM PersonRole pr
        JOIN Roles r ON r.rid = pr.roleId
        WHERE pr.personId = ${personId}
          AND pr.isActive = 1
        ORDER BY r.roleName
      `
    );
    return rows.map((r) => r.roleName);
  }

  public async getRoleIdByName(roleName: string): Promise<number | null> {
    const rows = await this.prisma.$queryRaw<RoleIdRow[]>(
      Prisma.sql`
        SELECT rid
        FROM Roles
        WHERE roleName = ${roleName}
          AND isActive = 1
        LIMIT 1
      `
    );
    return rows.length === 1 ? rows[0].rid : null;
  }

  public async isRoleAssignedToPerson(personId: number, roleId: number): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<ExistsRow[]>(
      Prisma.sql`
        SELECT 1 AS ok
        FROM PersonRole
        WHERE personId = ${personId}
          AND roleId = ${roleId}
          AND isActive = 1
        LIMIT 1
      `
    );
    return rows.length === 1;
  }

  public async isAssumeAllowed(fromRoleId: number, toRoleId: number): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<ExistsRow[]>(
      Prisma.sql`
        SELECT 1 AS ok
        FROM RoleAssumeRule
        WHERE fromRoleId = ${fromRoleId}
          AND toRoleId = ${toRoleId}
          AND isAllowed = 1
        LIMIT 1
      `
    );
    return rows.length === 1;
  }

  public async setActiveRole(personId: number, roleId: number): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE Person SET activeRid = ${roleId} WHERE pid = ${personId}`
    );
  }

  public async getEffectivePermissionMap(roleId: number): Promise<PermissionMap> {
    const rows = await this.prisma.$queryRaw<ViewRow[]>(
      Prisma.sql`
        SELECT domainCode, actionCode
        FROM vRoleEffectivePermission
        WHERE roleId = ${roleId}
      `
    );

    const map: Record<string, ActionCode[]> = {};

    for (const row of rows) {
      const d = row.domainCode;
      const a = row.actionCode as ActionCode;

      const list = map[d] ?? [];
      if (!list.includes(a)) list.push(a);
      map[d] = list;
    }

    // freeze-ish: return readonly arrays
    const out: PermissionMap = {};
    for (const [k, v] of Object.entries(map)) out[k] = Object.freeze([...v]);
    return out;
  }

  public async grantRoleToPerson(personId: number, roleId: number, assignedByPersonId: number | null): Promise<void> {
    // idempotent grant
    await this.prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO PersonRole (personId, roleId, assignedByPersonId, isActive)
        VALUES (${personId}, ${roleId}, ${assignedByPersonId}, 1)
        ON DUPLICATE KEY UPDATE isActive = 1, assignedByPersonId = VALUES(assignedByPersonId)
      `
    );
  }

  public async revokeRoleFromPerson(personId: number, roleId: number): Promise<void> {
    await this.prisma.$executeRaw(
      Prisma.sql`
        UPDATE PersonRole
        SET isActive = 0
        WHERE personId = ${personId}
          AND roleId = ${roleId}
      `
    );
  }
}
