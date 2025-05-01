import { Prospect } from '../domain/prospect.entity';
import { ProspectRepository } from '../domain/prospect.repository';
import { Result } from '../../../shared/domain/Result';

export class ProspectService {
  private readonly prospectRepository: ProspectRepository;

  constructor(prospectRepository: ProspectRepository) {
    this.prospectRepository = prospectRepository;
  }

  /**
   * Get a prospect by id
   */
  async getProspectById(id: number): Promise<Result<Prospect | null>> {
    return await this.prospectRepository.findById(id);
  }

  /**
   * Get all prospects with optional pagination
   */
  async getAllProspects(limit?: number, offset?: number): Promise<Result<Prospect[]>> {
    return await this.prospectRepository.findAll(limit, offset);
  }

  /**
   * Create a new prospect
   */
  async createProspect(prospectData: {
    firstName: string;
    lastName: string;
    position: string;
    college: string;
    height: number;
    weight: number;
    handSize?: number;
    armLength?: number;
    homeCity?: string;
    homeState?: string;
    fortyTime?: number;
    tenYardSplit?: number;
    verticalLeap?: number;
    broadJump?: number;
    threeCone?: number;
    twentyYardShuttle?: number;
    benchPress?: number;
    drafted?: boolean;
  }): Promise<Result<Prospect>> {
    const prospectResult = Prospect.create({
      ...prospectData,
      drafted: prospectData.drafted !== undefined ? prospectData.drafted : false,
    });

    if (prospectResult.isFailure) {
      return Result.fail<Prospect>(prospectResult.error as string);
    }

    const prospect = prospectResult.getValue();
    return await this.prospectRepository.create(prospect);
  }

  /**
   * Update an existing prospect
   */
  async updateProspect(
    id: number,
    prospectData: {
      firstName?: string;
      lastName?: string;
      position?: string;
      college?: string;
      height?: number;
      weight?: number;
      handSize?: number;
      armLength?: number;
      homeCity?: string;
      homeState?: string;
      fortyTime?: number;
      tenYardSplit?: number;
      verticalLeap?: number;
      broadJump?: number;
      threeCone?: number;
      twentyYardShuttle?: number;
      benchPress?: number;
    },
  ): Promise<Result<Prospect>> {
    // Check if prospect exists
    const existingProspectResult = await this.prospectRepository.findById(id);

    if (existingProspectResult.isFailure) {
      return Result.fail<Prospect>(existingProspectResult.error as string);
    }

    const existingProspect = existingProspectResult.getValue();
    if (!existingProspect) {
      return Result.fail<Prospect>(`Prospect with ID ${id} not found`);
    }

    // Create updated prospect with merged data
    const mergedData = {
      id,
      firstName: prospectData.firstName || existingProspect.firstName,
      lastName: prospectData.lastName || existingProspect.lastName,
      position: prospectData.position || existingProspect.position,
      college: prospectData.college || existingProspect.college,
      height: prospectData.height || existingProspect.height,
      weight: prospectData.weight || existingProspect.weight,
      handSize:
        prospectData.handSize !== undefined ? prospectData.handSize : existingProspect.handSize,
      armLength:
        prospectData.armLength !== undefined ? prospectData.armLength : existingProspect.armLength,
      homeCity:
        prospectData.homeCity !== undefined ? prospectData.homeCity : existingProspect.homeCity,
      homeState:
        prospectData.homeState !== undefined ? prospectData.homeState : existingProspect.homeState,
      fortyTime:
        prospectData.fortyTime !== undefined ? prospectData.fortyTime : existingProspect.fortyTime,
      tenYardSplit:
        prospectData.tenYardSplit !== undefined
          ? prospectData.tenYardSplit
          : existingProspect.tenYardSplit,
      verticalLeap:
        prospectData.verticalLeap !== undefined
          ? prospectData.verticalLeap
          : existingProspect.verticalLeap,
      broadJump:
        prospectData.broadJump !== undefined ? prospectData.broadJump : existingProspect.broadJump,
      threeCone:
        prospectData.threeCone !== undefined ? prospectData.threeCone : existingProspect.threeCone,
      twentyYardShuttle:
        prospectData.twentyYardShuttle !== undefined
          ? prospectData.twentyYardShuttle
          : existingProspect.twentyYardShuttle,
      benchPress:
        prospectData.benchPress !== undefined
          ? prospectData.benchPress
          : existingProspect.benchPress,
      drafted: existingProspect.drafted,
      draftYear: existingProspect.draftYear,
      teamId: existingProspect.teamId,
      draftPickId: existingProspect.draftPickId,
    };

    const prospectResult = Prospect.create(mergedData);

    if (prospectResult.isFailure) {
      return Result.fail<Prospect>(prospectResult.error as string);
    }

    const prospect = prospectResult.getValue();
    return await this.prospectRepository.update(id, prospect);
  }

  /**
   * Delete a prospect by id
   */
  async deleteProspect(id: number): Promise<Result<boolean>> {
    // Check if prospect exists
    const existingProspectResult = await this.prospectRepository.findById(id);

    if (existingProspectResult.isFailure) {
      return Result.fail<boolean>(existingProspectResult.error as string);
    }

    const existingProspect = existingProspectResult.getValue();
    if (!existingProspect) {
      return Result.fail<boolean>(`Prospect with ID ${id} not found`);
    }

    return await this.prospectRepository.delete(id);
  }

  /**
   * Draft a prospect
   */
  async draftProspect(
    id: number,
    draftYear: number,
    teamId: number,
    draftPickId: number,
  ): Promise<Result<Prospect>> {
    // Check if prospect exists
    const existingProspectResult = await this.prospectRepository.findById(id);

    if (existingProspectResult.isFailure) {
      return Result.fail<Prospect>(existingProspectResult.error as string);
    }

    const existingProspect = existingProspectResult.getValue();
    if (!existingProspect) {
      return Result.fail<Prospect>(`Prospect with ID ${id} not found`);
    }

    // Check if already drafted
    if (existingProspect.drafted) {
      return Result.fail<Prospect>(`Prospect with ID ${id} has already been drafted`);
    }

    // Mark as drafted
    const updatedProspectResult = existingProspect.markAsDrafted(draftYear, teamId, draftPickId);

    if (updatedProspectResult.isFailure) {
      return Result.fail<Prospect>(updatedProspectResult.error as string);
    }

    const updatedProspect = updatedProspectResult.getValue();
    return await this.prospectRepository.update(id, updatedProspect);
  }

  /**
   * Get prospects by position
   */
  async getProspectsByPosition(position: string): Promise<Result<Prospect[]>> {
    return await this.prospectRepository.findByPosition(position);
  }

  /**
   * Get prospects by college
   */
  async getProspectsByCollege(college: string): Promise<Result<Prospect[]>> {
    return await this.prospectRepository.findByCollege(college);
  }

  /**
   * Get prospects by team
   */
  async getProspectsByTeam(teamId: number): Promise<Result<Prospect[]>> {
    return await this.prospectRepository.findByTeam(teamId);
  }

  /**
   * Get prospects by draft year
   */
  async getProspectsByDraftYear(draftYear: number): Promise<Result<Prospect[]>> {
    return await this.prospectRepository.findByDraftYear(draftYear);
  }

  /**
   * Get undrafted prospects
   */
  async getUndraftedProspects(): Promise<Result<Prospect[]>> {
    return await this.prospectRepository.findUndrafted();
  }

  /**
   * Get prospect by draft pick
   */
  async getProspectByDraftPick(draftPickId: number): Promise<Result<Prospect | null>> {
    return await this.prospectRepository.findByDraftPick(draftPickId);
  }

  /**
   * Search prospects by name
   */
  async searchProspectsByName(name: string): Promise<Result<Prospect[]>> {
    return await this.prospectRepository.searchByName(name);
  }

  /**
   * Get prospects by filters
   */
  async getProspectsByFilters(filters: {
    position?: string;
    college?: string;
    drafted?: boolean;
    draftYear?: number;
    teamId?: number;
  }): Promise<Result<Prospect[]>> {
    return await this.prospectRepository.findByFilters(filters);
  }

  /**
   * Update prospect combine results
   */
  async updateProspectCombineResults(
    id: number,
    combineData: {
      fortyTime?: number;
      tenYardSplit?: number;
      verticalLeap?: number;
      broadJump?: number;
      threeCone?: number;
      twentyYardShuttle?: number;
      benchPress?: number;
    },
  ): Promise<Result<Prospect>> {
    // Check if prospect exists
    const existingProspectResult = await this.prospectRepository.findById(id);

    if (existingProspectResult.isFailure) {
      return Result.fail<Prospect>(existingProspectResult.error as string);
    }

    const existingProspect = existingProspectResult.getValue();
    if (!existingProspect) {
      return Result.fail<Prospect>(`Prospect with ID ${id} not found`);
    }

    // Update combine results
    const updatedProspectResult = existingProspect.updateCombineResults(
      combineData.fortyTime,
      combineData.tenYardSplit,
      combineData.verticalLeap,
      combineData.broadJump,
      combineData.threeCone,
      combineData.twentyYardShuttle,
      combineData.benchPress,
    );

    if (updatedProspectResult.isFailure) {
      return Result.fail<Prospect>(updatedProspectResult.error as string);
    }

    const updatedProspect = updatedProspectResult.getValue();
    return await this.prospectRepository.update(id, updatedProspect);
  }
}
