// types/job-enums.ts
export type JobType =
  | 'PLAYER_SYNC'
  | 'TEAM_SYNC'
  | 'FULL_SYNC'
  | 'VALIDATION'
  | 'ENRICHMENT'

export type JobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
