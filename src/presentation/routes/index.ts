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

const router = Router();

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
 * STANDINGS / SCOREBOARD
 * ───────────────────────────── */
router.use("/standings", standingsRoutes);
router.use("/teamStandings", teamStandingsRoutes);
router.use("/scoreboard", buildScoreboardRouter());

/* ─────────────────────────────
 * JOBS
 * ───────────────────────────── */
router.use("/jobs", jobRoutes);
router.use("/jobs/kickoff/scoreboard", scoreboardJobs);
router.use("/jobs/scoreboard/schedule", scoreboardScheduleRoutes);

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
