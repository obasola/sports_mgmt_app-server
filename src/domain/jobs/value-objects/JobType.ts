// src/domain/jobs/value-objects/JobType.ts

/**
 * Canonical JobType values stored in Job.type (VARCHAR).
 *
 * IMPORTANT:
 * - Keep these values stable: they are persisted in DB.
 * - Use SCREAMING_SNAKE_CASE to match existing Job rows.
 */
export enum JobType {
  // Existing DB-visible types (you already have rows with these)
  IMPORT_NFL_SEASON = 'IMPORT_NFL_SEASON',
  IMPORT_SCORES_WEEK = 'IMPORT_SCORES_WEEK',
  SYNC_TEAMS = 'SYNC_TEAMS',
  ENRICHMENT = 'ENRICHMENT',
  PLAYER_SYNC = 'PLAYER_SYNC',

  // Present in codebase / expected
  IMPORT_SCORES_DATE = 'IMPORT_SCORES_DATE',
  NFL_EVENTS_WEEKLY = 'NFL_EVENTS_WEEKLY',

  // Legacy/other (keep if referenced anywhere)
  SCOREBOARD_SYNC = 'SCOREBOARD_SYNC',
  BACKFILL_SEASON = 'BACKFILL_SEASON',

  // NEW
  DRAFT_ORDER_COMPUTE = 'DRAFT_ORDER_COMPUTE',

  // Optional future types (only keep if you actually use them)
  PF_DRAFT_SCRAPER = 'PF_DRAFT_SCRAPER',
  ESPN_PLAYER_IMPORT = 'ESPN_PLAYER_IMPORT',
  NFL_STATS_IMPORT = 'NFL_STATS_IMPORT',
}
