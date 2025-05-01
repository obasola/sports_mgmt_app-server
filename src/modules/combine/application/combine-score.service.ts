import { CombineScore } from '../domain/combine-score.entity';
import { CombineScoreRepository } from '../domain/combine-score.repository';
import { Result } from '../../../shared/domain/Result';

export class CombineScoreService {
  private readonly combineScoreRepository: CombineScoreRepository;

  constructor(combineScoreRepository: CombineScoreRepository) {
    this.combineScoreRepository = combineScoreRepository;
  }

  /**
   * Get a combine score by id
   */
  async getCombineScoreById(id: number): Promise<Result<CombineScore | null>> {
    return await this.combineScoreRepository.findById(id);
  }

  /**
   * Get combine score by player id
   */
  async getCombineScoreByPlayerId(playerId: number): Promise<Result<CombineScore | null>> {
    return await this.combineScoreRepository.findByPlayerId(playerId);
  }

  /**
   * Get all combine scores with optional pagination
   */
  async getAllCombineScores(limit?: number, offset?: number): Promise<Result<CombineScore[]>> {
    return await this.combineScoreRepository.findAll(limit, offset);
  }

  /**
   * Create a new combine score
   */
  async createCombineScore(combineScoreData: {
    fortyTime?: number;
    tenYardSplit?: number;
    twentyYardShuttle?: number;
    threeCone?: number;
    verticalLeap?: number;
    broadJump?: number;
    playerId?: number;
  }): Promise<Result<CombineScore>> {
    const combineScoreResult = CombineScore.create(combineScoreData);

    if (combineScoreResult.isFailure) {
      return Result.fail<CombineScore>(combineScoreResult.error as string);
    }

    const combineScore = combineScoreResult.getValue();
    return await this.combineScoreRepository.create(combineScore);
  }

  /**
   * Update an existing combine score
   */
  async updateCombineScore(
    id: number,
    combineScoreData: {
      fortyTime?: number;
      tenYardSplit?: number;
      twentyYardShuttle?: number;
      threeCone?: number;
      verticalLeap?: number;
      broadJump?: number;
      playerId?: number;
    },
  ): Promise<Result<CombineScore>> {
    // Check if combine score exists
    const existingCombineScoreResult = await this.combineScoreRepository.findById(id);

    if (existingCombineScoreResult.isFailure) {
      return Result.fail<CombineScore>(existingCombineScoreResult.error as string);
    }

    const existingCombineScore = existingCombineScoreResult.getValue();
    if (!existingCombineScore) {
      return Result.fail<CombineScore>(`Combine score with ID ${id} not found`);
    }

    // Create updated combine score with merged data
    const mergedData = {
      id,
      fortyTime:
        combineScoreData.fortyTime !== undefined
          ? combineScoreData.fortyTime
          : existingCombineScore.fortyTime,
      tenYardSplit:
        combineScoreData.tenYardSplit !== undefined
          ? combineScoreData.tenYardSplit
          : existingCombineScore.tenYardSplit,
      twentyYardShuttle:
        combineScoreData.twentyYardShuttle !== undefined
          ? combineScoreData.twentyYardShuttle
          : existingCombineScore.twentyYardShuttle,
      threeCone:
        combineScoreData.threeCone !== undefined
          ? combineScoreData.threeCone
          : existingCombineScore.threeCone,
      verticalLeap:
        combineScoreData.verticalLeap !== undefined
          ? combineScoreData.verticalLeap
          : existingCombineScore.verticalLeap,
      broadJump:
        combineScoreData.broadJump !== undefined
          ? combineScoreData.broadJump
          : existingCombineScore.broadJump,
      playerId:
        combineScoreData.playerId !== undefined
          ? combineScoreData.playerId
          : existingCombineScore.playerId,
    };

    const combineScoreResult = CombineScore.create(mergedData);

    if (combineScoreResult.isFailure) {
      return Result.fail<CombineScore>(combineScoreResult.error as string);
    }

    const combineScore = combineScoreResult.getValue();
    return await this.combineScoreRepository.update(id, combineScore);
  }

  /**
   * Delete a combine score by id
   */
  async deleteCombineScore(id: number): Promise<Result<boolean>> {
    // Check if combine score exists
    const existingCombineScoreResult = await this.combineScoreRepository.findById(id);

    if (existingCombineScoreResult.isFailure) {
      return Result.fail<boolean>(existingCombineScoreResult.error as string);
    }

    const existingCombineScore = existingCombineScoreResult.getValue();
    if (!existingCombineScore) {
      return Result.fail<boolean>(`Combine score with ID ${id} not found`);
    }

    return await this.combineScoreRepository.delete(id);
  }

  /**
   * Update speed metrics of a combine score
   */
  async updateSpeedMetrics(
    id: number,
    speedData: {
      fortyTime?: number;
      tenYardSplit?: number;
      twentyYardShuttle?: number;
      threeCone?: number;
    },
  ): Promise<Result<CombineScore>> {
    // Check if combine score exists
    const existingCombineScoreResult = await this.combineScoreRepository.findById(id);

    if (existingCombineScoreResult.isFailure) {
      return Result.fail<CombineScore>(existingCombineScoreResult.error as string);
    }

    const existingCombineScore = existingCombineScoreResult.getValue();
    if (!existingCombineScore) {
      return Result.fail<CombineScore>(`Combine score with ID ${id} not found`);
    }

    // Update speed metrics
    const updatedCombineScoreResult = existingCombineScore.updateSpeedMetrics(
      speedData.fortyTime,
      speedData.tenYardSplit,
      speedData.twentyYardShuttle,
      speedData.threeCone,
    );

    if (updatedCombineScoreResult.isFailure) {
      return Result.fail<CombineScore>(updatedCombineScoreResult.error as string);
    }

    const updatedCombineScore = updatedCombineScoreResult.getValue();
    return await this.combineScoreRepository.update(id, updatedCombineScore);
  }

  /**
   * Update jump metrics of a combine score
   */
  async updateJumpMetrics(
    id: number,
    jumpData: {
      verticalLeap?: number;
      broadJump?: number;
    },
  ): Promise<Result<CombineScore>> {
    // Check if combine score exists
    const existingCombineScoreResult = await this.combineScoreRepository.findById(id);

    if (existingCombineScoreResult.isFailure) {
      return Result.fail<CombineScore>(existingCombineScoreResult.error as string);
    }

    const existingCombineScore = existingCombineScoreResult.getValue();
    if (!existingCombineScore) {
      return Result.fail<CombineScore>(`Combine score with ID ${id} not found`);
    }

    // Update jump metrics
    const updatedCombineScoreResult = existingCombineScore.updateJumpMetrics(
      jumpData.verticalLeap,
      jumpData.broadJump,
    );

    if (updatedCombineScoreResult.isFailure) {
      return Result.fail<CombineScore>(updatedCombineScoreResult.error as string);
    }

    const updatedCombineScore = updatedCombineScoreResult.getValue();
    return await this.combineScoreRepository.update(id, updatedCombineScore);
  }

  /**
   * Link combine score to player
   */
  async linkCombineScoreToPlayer(id: number, playerId: number): Promise<Result<CombineScore>> {
    // Check if combine score exists
    const existingCombineScoreResult = await this.combineScoreRepository.findById(id);

    if (existingCombineScoreResult.isFailure) {
      return Result.fail<CombineScore>(existingCombineScoreResult.error as string);
    }

    const existingCombineScore = existingCombineScoreResult.getValue();
    if (!existingCombineScore) {
      return Result.fail<CombineScore>(`Combine score with ID ${id} not found`);
    }

    // Link to player
    const updatedCombineScoreResult = existingCombineScore.linkToPlayer(playerId);

    if (updatedCombineScoreResult.isFailure) {
      return Result.fail<CombineScore>(updatedCombineScoreResult.error as string);
    }

    const updatedCombineScore = updatedCombineScoreResult.getValue();
    return await this.combineScoreRepository.update(id, updatedCombineScore);
  }

  /**
   * Get combine scores by filters
   */
  async getCombineScoresByFilters(filters: {
    fortyTimeLessThan?: number;
    verticalLeapGreaterThan?: number;
    broadJumpGreaterThan?: number;
  }): Promise<Result<CombineScore[]>> {
    return await this.combineScoreRepository.findByFilters(filters);
  }
}
