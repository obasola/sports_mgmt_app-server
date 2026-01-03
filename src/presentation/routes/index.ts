// src/presentation/routes/index.ts
import { Router } from "express";

import { authRoutes } from "./authRoutes";
import { teamRoutes } from "./teamRoutes";
import { personRoutes } from "./personRoutes";
import { playerRoutes } from "./playerRoutes";
import { playerAwardRoutes } from "./playerAwardRoutes";
import { combineScoreRoutes } from "./combineScoreRoutes";
import { prospectRoutes } from "./prospectRoutes";
import { scheduleRoutes } from "./scheduleRoutes";
import { teamNeedRoutes } from "./TeamNeedRoutes";
import { playerTeamRoutes } from "./PlayerTeamRoutes";
import { postSeasonResultRoutes } from "./PostSeasonResultRoutes";
import { gameRoutes } from "./gameRoutes";
import { jobRoutes } from "./jobRoutes";
import { scoreboardJobs } from "./jobs.scoreboard";
import { scoreboardScheduleRoutes } from "./job.scoreboard.schedule";
import standingsRoutes from "./standingsRoutes";
import { teamStandingsRoutes } from "./teamStandingsRoutes";
import { buildScoreboardRouter } from "../controllers/ScoreboardController";
import draftPickRoutes from "./draftPickRoute";
import { playoffsRoutes } from "./playoffsRoutes"; // 👈 NEW
import { prisma } from "@/infrastructure/prisma";
import { buildDraftSimulatorModule } from "@/modules/draftSimulator/moduleFactory";
import { buildDraftOrderModule } from "@/modules/draftOrder/moduleFactory";

import { queueJobService, runJobService } from '@/infrastructure/dependencies'
import { DraftOrderJobController } from '@/modules/draftOrder/presentation/controllers/DraftOrderJobController'
import { buildDraftOrderJobRoutes } from '@/modules/draftOrder/presentation/routes/draftOrderJobRoutes'

const router = Router();
const draftOrderJobController = new DraftOrderJobController(queueJobService, runJobService)


/* ─────────────────────────────
 * AUTH
 * ───────────────────────────── */
router.use("/auth", authRoutes);

/* ─────────────────────────────
 * CORE DOMAIN ROUTES
 * ───────────────────────────── */
router.use("/teams", teamRoutes);
router.use("/persons", personRoutes);
router.use("/players", playerRoutes);
router.use("/player-awards", playerAwardRoutes);
router.use("/player-teams", playerTeamRoutes);
router.use("/prospects", prospectRoutes);
router.use("/postseason-results", postSeasonResultRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/team-needs", teamNeedRoutes);
router.use("/games", gameRoutes);
router.use("/draftpicks", draftPickRoutes);

/* ─────────────────────────────
 * STANDINGS / SCOREBOARD / PLAYOFFS
 * ───────────────────────────── */
router.use("/standings", standingsRoutes);
router.use("/teamStandings", standingsRoutes);
router.use("/scoreboard", buildScoreboardRouter());
router.use('/draftSimulator', buildDraftSimulatorModule(prisma))
router.use('/draft-order', buildDraftOrderModule(prisma))
router.use("/playoffs", playoffsRoutes); // 👈 NEW


/* ─────────────────────────────
 * JOBS
 * ───────────────────────────── */
router.use("/jobs", jobRoutes);
router.use("/jobs/kickoff/scoreboard", scoreboardJobs);
router.use("/jobs/scoreboard/schedule", scoreboardScheduleRoutes);

router.use('/draft-order/jobs', buildDraftOrderJobRoutes(draftOrderJobController))
/* ─────────────────────────────
 * ROUTER-LOCAL HEALTH & INFO
 * (these live under /api/*)
 * ───────────────────────────── */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Sports Management API v1 is running",
    timestamp: new Date().toISOString(),
  });
});

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sports Management API v1",
  });
});

export { router as apiRoutes };
