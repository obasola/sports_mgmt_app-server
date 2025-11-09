// src/domain/team/repositories/ITeamRepository.ts
import { Team } from '../entities/Team';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

/** Extra filters to support ESPN mapping & fast lookups */
export interface TeamFilters {
  name?: string;
  city?: string;
  state?: string;
  conference?: string;
  division?: string;
  stadium?: string;
  scheduleId?: number;

  /** NEW: for direct lookups and admin UIs */
  abbreviation?: string;
  espnTeamId?: number;
}

/** Input contract for syncing/upserting teams from ESPN Core v2 */
export interface TeamUpsertInput {
  espnTeamId: number;                 // required, stable ESPN team id
  abbreviation?: string | null;       // e.g., "KC"
  displayName?: string | null;        // e.g., "Kansas City Chiefs"
  location?: string | null;           // e.g., "Kansas City"
  name?: string | null;               // e.g., "Chiefs"
  shortDisplayName?: string | null;   // e.g., "Chiefs"
}

export interface BulkUpsertResult {
  created: number;
  updated: number;
  total: number;
}

export interface ITeamRepository {
  // ------------------------------------------------------------------
  // Core CRUD
  // ------------------------------------------------------------------
  save(team: Team): Promise<Team>;
  findById(id: number): Promise<Team | null>;
  findAll(filters?: TeamFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Team>>;
  findAllTeamNameAndIds(): Promise<any[]>;
  update(id: number, team: Team): Promise<Team>;
  delete(id: number): Promise<void>;
  exists(id: number): Promise<boolean>;

  // ------------------------------------------------------------------
  // Domain-specific queries (existing)
  // ------------------------------------------------------------------
  findByName(name: string): Promise<Team | null>;
  findByConference(conference: string): Promise<Team[]>;
  findByDivision(division: string): Promise<Team[]>;
  findByLocation(city: string, state: string): Promise<Team[]>;
  findByState(state: string): Promise<Team[]>;
  findByScheduleId(scheduleId: number): Promise<Team | null>;
  findTeamsWithSchedules(): Promise<Team[]>;
  findTeamsWithoutSchedules(): Promise<Team[]>;
  countByConference(): Promise<{ conference: string; count: number }[]>;
  countByDivision(): Promise<{ division: string; count: number }[]>;

  // ------------------------------------------------------------------
  // NEW — ESPN mapping & fast lookups to support import/backfill services
  // ------------------------------------------------------------------

  /** Upsert a single team from ESPN data; returns the hydrated Team (with id). */
  upsertFromEspn(input: TeamUpsertInput): Promise<Team>;

  /** Convenience: upsert and return the numeric Team.id for piping in import jobs. */
  upsertFromEspnGetId(input: TeamUpsertInput): Promise<number>;

  /** Bulk upsert (optionally with concurrency in the concrete implementation). */
  upsertManyFromEspn(inputs: TeamUpsertInput[]): Promise<BulkUpsertResult>;

  /** Fast id lookup by ESPN team id (preferred primary mapping). */
  findIdByEspnTeamId(espnTeamId: number): Promise<number | null>;

  /** Retrieve full Team by ESPN team id. */
  findByEspnTeamId(espnTeamId: number): Promise<Team | null>;

  /** Fast id lookup by abbreviation (fallback mapping). */
  findIdByAbbreviation(abbreviation: string): Promise<number | null>;

  /** Retrieve full Team by abbreviation. */
  findByAbbreviation(abbreviation: string): Promise<Team | null>;

  /**
   * Ensure a mapping exists and return Team.id.
   * Implementations may try ESPN id first, then abbreviation, then create/update.
   */
  ensureMappingFromEspn(input: TeamUpsertInput): Promise<number>;
}
