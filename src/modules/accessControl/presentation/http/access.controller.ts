import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { z } from "zod";

import { GetMyAccessContextUseCase } from "../../application/usecases/GetMyAccessContext.usecase";
import { SwitchActiveRoleUseCase } from "../../application/usecases/SwitchActiveRole.usecase";
import type { IAccessControlRepository } from "../../domain/IAccessControlRepository";
import { ForbiddenError, NotAuthenticatedError, NotFoundError, ValidationError } from "../../domain/access.errors";
import { adminGrantRoleSchema, adminRevokeRoleSchema, switchRoleSchema } from "./access.schemas";

type UserShape = { personId?: unknown; pid?: unknown; id?: unknown; userId?: unknown };

function extractPersonId(req: Request): number {
  const u = (req as unknown as { user?: unknown }).user;
  if (!u || typeof u !== "object") throw new NotAuthenticatedError();

  const o = u as UserShape;

  const candidates: unknown[] = [o.personId, o.pid, o.id, o.userId];
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) return c;
    if (typeof c === "string") {
      const n = Number(c);
      if (Number.isFinite(n)) return n;
    }
  }
  throw new NotAuthenticatedError();
}

@injectable()
export class AccessController {
  constructor(
    private readonly getContext: GetMyAccessContextUseCase,
    private readonly switchRole: SwitchActiveRoleUseCase,
    @inject("IAccessControlRepository") private readonly repo: IAccessControlRepository
  ) {}

  public getMyContext = async (req: Request, res: Response): Promise<void> => {
    try {
      const personId = extractPersonId(req);
      const ctx = await this.getContext.execute(personId);
      res.json(ctx);
    } catch (err: unknown) {
      this.handleError(res, err);
    }
  };

  public switchActiveRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const personId = extractPersonId(req);
      const parsed = switchRoleSchema.parse(req.body);
      const ctx = await this.switchRole.execute(personId, parsed.roleName);
      res.json(ctx);
    } catch (err: unknown) {
      this.handleError(res, err);
    }
  };

  // Admin-only (for now via SQL or API; UI later)
  public adminGrantRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = extractPersonId(req);
      await this.assertActiveRoleIsAdmin(adminId);

      const personId = this.parseIntParam(req.params.personId, "personId");
      const parsed = adminGrantRoleSchema.parse(req.body);

      const roleId = await this.repo.getRoleIdByName(parsed.roleName.trim().toLowerCase());
      if (!roleId) throw new NotFoundError(`Role '${parsed.roleName}' not found.`);

      await this.repo.grantRoleToPerson(personId, roleId, adminId);
      res.json({ ok: true });
    } catch (err: unknown) {
      this.handleError(res, err);
    }
  };

  public adminRevokeRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = extractPersonId(req);
      await this.assertActiveRoleIsAdmin(adminId);

      const personId = this.parseIntParam(req.params.personId, "personId");
      const parsed = adminRevokeRoleSchema.parse(req.body);

      const roleId = await this.repo.getRoleIdByName(parsed.roleName.trim().toLowerCase());
      if (!roleId) throw new NotFoundError(`Role '${parsed.roleName}' not found.`);

      await this.repo.revokeRoleFromPerson(personId, roleId);
      res.json({ ok: true });
    } catch (err: unknown) {
      this.handleError(res, err);
    }
  };

  private async assertActiveRoleIsAdmin(personId: number): Promise<void> {
    const person = await this.repo.getPersonWithActiveRole(personId);
    if (!person) throw new NotFoundError(`Person ${personId} not found.`);
    if ((person.activeRoleName ?? "").toLowerCase() !== "admin") {
      throw new ForbiddenError("Admin role is required.");
    }
  }

  private parseIntParam(v: unknown, name: string): number {
    if (typeof v !== "string") throw new ValidationError(`${name} param is required.`);
    const n = Number(v);
    if (!Number.isFinite(n)) throw new ValidationError(`${name} must be a number.`);
    return n;
  }

  private handleError(res: Response, err: unknown): void {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "VALIDATION_ERROR", details: err.errors });
      return;
    }
    if (err instanceof NotAuthenticatedError) {
      res.status(401).json({ error: err.code, message: err.message });
      return;
    }
    if (err instanceof ForbiddenError) {
      res.status(403).json({ error: err.code, message: err.message });
      return;
    }
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.code, message: err.message });
      return;
    }
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.code, message: err.message });
      return;
    }
    console.error("AccessController error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
