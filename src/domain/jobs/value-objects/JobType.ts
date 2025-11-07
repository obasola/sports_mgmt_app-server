// ============================================================================
// Jobs Module – Full DDD Implementation (TypeScript / Express / Prisma)
// ----------------------------------------------------------------------------
// Notes:
// - This is a production-ready baseline adhering to DDD + SOLID and your
//   layered architecture. It wires repositories (Prisma), application services,
//   an in-process runner (pluggable handlers), a cron scheduler, and HTTP
//   controllers with SSE log streaming.
// - Minimal external deps: express, node-cron, @prisma/client, zod (for DTO
//   validation). You can remove zod if you prefer manual validation.
// - Replace the placeholder handler impls in InProcessJobRunner with your real
//   importers (SyncTeamsService, BackfillSeasonService) via dependency injection.
// - Add to your existing server: import { mountJobRoutes, createJobModule } and
//   call mountJobRoutes(app, createJobModule(prisma)).
// ============================================================================

// ===================== DOMAIN LAYER =========================================

// src/domain/jobs/value-objects/JobType.ts
export enum JobType {
  SYNC_TEAMS = 'syncTeams',
  SCOREBOARD_SYNC = 'SCOREBOARD_SYNC',
  BACKFILL_SEASON = 'backfillSeason',

  PF_DRAFT_SCRAPER = 'PF_DRAFT_SCRAPER',
  ESPN_PLAYER_IMPORT = 'ESPN_PLAYER_IMPORT',
  NFL_STATS_IMPORT = 'NFL_STATS_IMPORT',
  IMPORT_SCORES_WEEK = 'IMPORT_SCORES_WEEK', // ← add this
}



