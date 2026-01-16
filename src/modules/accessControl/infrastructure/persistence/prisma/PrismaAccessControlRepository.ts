import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { inject, injectable } from "tsyringe";

import type { IAccessControlRepository, PersonRow } from "../../../domain/repositories/IAccessControlRepository";
import type { ActionCode, AssignedRole, PermissionMap, PermissionTuple } from "../../../domain/types/access.types";

@injectable()
export class PrismaAccessControlRepository implements IAccessControlRepository {
  public constructor(@inject("PrismaClient") private readonly db: PrismaClient) {}
  public async getPersonWithActiveRole(personId: number): Promise<PersonRow | null> {
    const p = await this.db.person.findUnique({
      where: { pid: personId },
      select: {
        pid: true,
        userName: true,
        activeRid: true,
        Roles: { select: { roleName: true } }, // relation via activeRid
      },
    });

    if (!p) return null;

    return {
      personId: p.pid,
      userName: p.userName,
      activeRid: p.activeRid ?? null,
      activeRoleName: p.Roles?.roleName ?? null,
    };
  }
  public async getAssignedRoles(personId: number): Promise<AssignedRole[]> {
    const rows = await this.db.personRole.findMany({
      where: {
        personId,
        isActive: true,
        revokedAt: null,
      },
      select: {
        Roles: { select: { rid: true, roleName: true } },
      },
      orderBy: { roleId: 'asc' },
    });

    return rows
      .map((r) => ({ rid: r.Roles.rid, roleName: r.Roles.roleName }))
      .filter((x) => typeof x.rid === 'number' && x.roleName.length > 0);
  }

  public async getRoleByName(roleName: string): Promise<AssignedRole | null> {
    const trimmed = roleName.trim();
    if (trimmed.length === 0) return null;

    const row = await this.db.roles.findUnique({
      where: { roleName: trimmed },
      select: { rid: true, roleName: true },
    });

    return row ? { rid: row.rid, roleName: row.roleName } : null;
  }
  public async isRoleAssignedToPerson(personId: number, roleId: number): Promise<boolean> {
    const count = await this.db.personRole.count({
      where: { personId, roleId, isActive: true, revokedAt: null },
    });
    return count > 0;
  }

  public async isAssumeAllowed(fromRoleId: number, toRoleId: number): Promise<boolean> {
    const rule = await this.db.roleAssumeRule.findUnique({
      where: { fromRoleId_toRoleId: { fromRoleId, toRoleId } },
      select: { isAllowed: true },
    });
    return Boolean(rule?.isAllowed);
  }
  
  public async setActiveRole(personId: number, roleId: number): Promise<void> {
    await this.db.person.update({
      where: { pid: personId },
      data: { activeRid: roleId },
    });
  }

  public async getEffectivePermissionMap(roleId: number): Promise<PermissionMap> {
    // If you have a DB view that already applies "EDIT implies VIEW", use it here.
    // For now, we implement the implication safely in code (still server-side).
    const rows = await this.db.rolePermission.findMany({
      where: {
        roleId,
        isAllowed: true,
      },
      select: {
        FeatureDomain: { select: { domainCode: true } },
        PermissionAction: { select: { actionCode: true } },
      },
    });

    const map: Record<string, Set<ActionCode>> = {};

    for (const r of rows) {
      const domain = r.FeatureDomain.domainCode;
      const action = r.PermissionAction.actionCode as ActionCode;

      if (!domain || !action) continue;

      if (!map[domain]) map[domain] = new Set<ActionCode>();
      map[domain].add(action);

      // "EDIT implies VIEW" (and practically, CREATE/DELETE/RUN also imply VIEW)
      if (action !== 'VIEW') map[domain].add('VIEW');
    }

    const out: PermissionMap = {};
    for (const [domain, set] of Object.entries(map)) {
      out[domain] = Array.from(set.values());
    }
    return out;
  }

  public async getRoleIdByName(roleNameLower: string): Promise<number | null> {
    const name = roleNameLower.trim().toLowerCase();
    if (!name) return null;

    const rows = await this.db.$queryRaw<Array<{ rid: number }>>(Prisma.sql`
      SELECT r.rid
      FROM Roles r
      WHERE LOWER(r.roleName) = ${name}
      LIMIT 1
    `);

    return rows.length > 0 ? rows[0].rid : null;
  }

  public async getRoleIdsForPerson(personId: number): Promise<number[]> {
    const rows = await this.db.$queryRaw<Array<{ rid: number }>>(Prisma.sql`
      SELECT pr.rid
      FROM PersonRole pr
      WHERE pr.pid = ${personId}
      ORDER BY pr.rid ASC
    `);

    return rows.map((r) => r.rid);
  }

  public async getPermissionsForRoleIds(roleIds: number[]): Promise<PermissionTuple[]> {
    if (roleIds.length === 0) return [];

    // RolePermission table assumed columns: rid, domainKey, actionKey (or similar)
    // We join PermissionAction + FeatureDomain to return normalized tuples (domain/action).
    // If your RolePermission stores direct strings, adjust SELECT accordingly.
    const rows = await this.db.$queryRaw<
      Array<{ domainKey: string; actionKey: string }>
    >(Prisma.sql`
      SELECT fd.domainKey AS domainKey, pa.actionKey AS actionKey
      FROM RolePermission rp
      JOIN FeatureDomain fd ON fd.fdid = rp.fdid
      JOIN PermissionAction pa ON pa.paid = rp.paid
      WHERE rp.rid IN (${Prisma.join(roleIds)})
      GROUP BY fd.domainKey, pa.actionKey
      ORDER BY fd.domainKey ASC, pa.actionKey ASC
    `);

    return rows.map((r) => ({ domain: r.domainKey, action: r.actionKey }));
  }

  public async grantRoleToPerson(
    personId: number,
    roleId: number,
    grantedByPersonId: number,
  ): Promise<void> {
    // If your PersonRole has audit columns, add them here.
    // For now: ensure row exists.
    await this.db.$executeRaw(Prisma.sql`
      INSERT INTO PersonRole (pid, rid)
      VALUES (${personId}, ${roleId})
      ON DUPLICATE KEY UPDATE pid = pid
    `);

    // If you log admin actions, do it here using grantedByPersonId.
    void grantedByPersonId;
  }

  public async revokeRoleFromPerson(personId: number, roleId: number): Promise<void> {
    await this.db.$executeRaw(Prisma.sql`
      DELETE FROM PersonRole
      WHERE pid = ${personId} AND rid = ${roleId}
    `);
  }

  public async canAssumeRole(fromRoleId: number, toRoleId: number): Promise<boolean> {
    // Assumes table RoleAssumeRule columns: fromRid, toRid (adjust if yours differ)
    const rows = await this.db.$queryRaw<Array<{ ok: number }>>(Prisma.sql`
      SELECT 1 AS ok
      FROM RoleAssumeRule rar
      WHERE rar.fromRid = ${fromRoleId} AND rar.toRid = ${toRoleId}
      LIMIT 1
    `);

    return rows.length > 0;
  }

  // ---- Keep any other existing methods your app uses below ----
  // If you already had additional methods in your previous repo file,
  // paste them back in and keep using Prisma delegates where they exist.
}
