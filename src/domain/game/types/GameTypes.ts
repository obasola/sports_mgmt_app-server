// src/domain/game/types/GameTypes.ts

/**
 * Game Status Enum - Single source of truth for valid game statuses
 */
export const GameStatus = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
} as const;

export type GameStatusType = (typeof GameStatus)[keyof typeof GameStatus];

/**
 * Type guard to check if a string is a valid game status
 */
export function isValidGameStatus(status: string): status is GameStatusType {
  return Object.values(GameStatus).includes(status as GameStatusType);
}

/**
 * Safely cast a string to GameStatusType
 * @throws Error if status is invalid
 */
export function toGameStatus(status: string | undefined): GameStatusType | undefined {
  if (!status) return undefined;
  if (isValidGameStatus(status)) return status;
  throw new Error(`Invalid game status: ${status}`);
}

/**
 * Season Type Enum
 */
export const SeasonType = {
  PRESEASON: 1,
  REGULAR: 2,
  PLAYOFFS: 3,
} as const;

export type SeasonTypeValue = (typeof SeasonType)[keyof typeof SeasonType];

/**
 * Game Week Ranges
 */
export const GameWeekRange = {
  PRESEASON_MIN: 0,
  PRESEASON_MAX: 20,
  REGULAR_MIN: 1,
  REGULAR_MAX: 18,
  PLAYOFF_MIN: 19,
  PLAYOFF_MAX: 25,
} as const;

/**
 * Type guard for preseason week
 */
export function isPreseasonWeek(week: number): boolean {
  return week >= GameWeekRange.PRESEASON_MIN && week <= GameWeekRange.PRESEASON_MAX;
}

/**
 * Type guard for regular season week
 */
export function isRegularSeasonWeek(week: number): boolean {
  return week >= GameWeekRange.REGULAR_MIN && week <= GameWeekRange.REGULAR_MAX;
}

/**
 * Type guard for playoff week
 */
export function isPlayoffWeek(week: number): boolean {
  return week >= GameWeekRange.PLAYOFF_MIN && week <= GameWeekRange.PLAYOFF_MAX;
}