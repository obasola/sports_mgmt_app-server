import { Router } from "express";
import { TeamNeedsController } from "./TeamNeedsController";

export function buildTeamNeedsRouter(controller: TeamNeedsController): Router {
  const router = Router();

  router.get("/teams/:teamId/needs-page", controller.getNeedsPage);
  router.put("/teams/:teamId/team-needs", controller.upsertTeamNeed);
  router.delete("/teams/:teamId/team-needs/:position", controller.deleteTeamNeed);

  return router;
}

