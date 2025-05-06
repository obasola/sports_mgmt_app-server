// src/modules/postSeasonResult/presentation/postSeasonResult.schema.ts
import Joi from 'joi';

/**
 * Validation schema for creating a new post-season result
 */
export const postSeasonResultSchema = Joi.object({
  playoffYear: Joi.number()
    .integer()
    .required()
    .min(1900)
    .max(2100)
    .description('The year of the playoff (required)'),

  lastRoundReached: Joi.string()
    .max(45)
    .allow(null)
    .description('The last playoff round reached (e.g., "Super Bowl", "Conference Championship")'),

  winLose: Joi.string()
    .valid('W', 'L')
    .allow(null)
    .description('Whether the team won (W) or lost (L) in that round'),

  opponentScore: Joi.number().integer().min(0).allow(null).description("The opponent's score"),

  teamScore: Joi.number().integer().min(0).allow(null).description("The team's score"),

  teamId: Joi.number().integer().allow(null).description('The team ID reference'),
});

/**
 * Validation schema for updating an existing post-season result
 * At least one property must be provided for an update
 */
export const postSeasonResultUpdateSchema = Joi.object({
  playoffYear: Joi.number().integer().min(1900).max(2100).description('The year of the playoff'),

  lastRoundReached: Joi.string()
    .max(45)
    .allow(null)
    .description('The last playoff round reached (e.g., "Super Bowl", "Conference Championship")'),

  winLose: Joi.string()
    .valid('W', 'L')
    .allow(null)
    .description('Whether the team won (W) or lost (L) in that round'),

  opponentScore: Joi.number().integer().min(0).allow(null).description("The opponent's score"),

  teamScore: Joi.number().integer().min(0).allow(null).description("The team's score"),

  teamId: Joi.number().integer().allow(null).description('The team ID reference'),
})
  .min(1)
  .description('At least one property must be provided for an update');

/**
 * Validation schema for batch creation of post-season results
 */
export const postSeasonResultBatchSchema = Joi.array()
  .items(postSeasonResultSchema)
  .min(1)
  .max(100)
  .description('Array of post-season results to create (max 100 items)');

/**
 * Extended validation that includes cross-field validations
 * This can be used after basic schema validation passes
 */
export const validatePostSeasonResultBusinessRules = (data: any): string[] => {
  const errors: string[] = [];

  // Validate that if one score is provided, the other must be as well
  if (
    (data.teamScore !== null && data.opponentScore === null) ||
    (data.teamScore === null && data.opponentScore !== null)
  ) {
    errors.push('Both team score and opponent score must be provided together');
  }

  // Validate that if winLose is W, then teamScore must be greater than opponentScore
  if (
    data.winLose === 'W' &&
    data.teamScore !== null &&
    data.opponentScore !== null &&
    data.teamScore <= data.opponentScore
  ) {
    errors.push('Team score must be greater than opponent score when winLose is W');
  }

  // Validate that if winLose is L, then teamScore must be less than opponentScore
  if (
    data.winLose === 'L' &&
    data.teamScore !== null &&
    data.opponentScore !== null &&
    data.teamScore >= data.opponentScore
  ) {
    errors.push('Team score must be less than opponent score when winLose is L');
  }

  return errors;
};
