import { Router } from "express";
import { container } from "tsyringe";
import { AccessController } from "./access.controller";
import { requireAuth } from "@/modules/auth/presentation/http/middleware/requireAuth.middleware";
//import { requireAuth } from "@/modules/auth/authGuard"; // keep your existing auth guard

export function buildAccessRoutes(): Router {
  const r = Router();
  const ctrl = container.resolve(AccessController);

  // frontend needs these now
  r.get("/context", requireAuth, ctrl.getMyContext);
  r.post("/switch-role", requireAuth, ctrl.switchActiveRole);

  // admin-only assignment ops (UI later)
  r.post("/admin/users/:personId/roles/grant", requireAuth, ctrl.adminGrantRole);
  r.post("/admin/users/:personId/roles/revoke", requireAuth, ctrl.adminRevokeRole);

  return r;
}
