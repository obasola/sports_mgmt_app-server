import { TeamNeed } from '../domain/team-need.entity';
import { TeamNeedRepository } from '../domain/team-need.repository';

export class TeamNeedService {
  constructor(private teamNeedRepository: TeamNeedRepository) {}

  async getAllTeamNeeds(): Promise<TeamNeed[]> {
    return await this.teamNeedRepository.findAll();
  }

  async getTeamNeedById(id: number): Promise<TeamNeed | null> {
    return await this.teamNeedRepository.findById(id);
  }

  async getTeamNeedsByTeamId(teamId: number): Promise<TeamNeed[]> {
    return await this.teamNeedRepository.findByTeamId(teamId);
  }

  async getTeamNeedsByPosition(position: string): Promise<TeamNeed[]> {
    return await this.teamNeedRepository.findByPosition(position);
  }

  async getTeamNeedsByPriority(priority: number): Promise<TeamNeed[]> {
    return await this.teamNeedRepository.findByPriority(priority);
  }

  async getTeamNeedsByDraftYear(draftYear: Date): Promise<TeamNeed[]> {
    return await this.teamNeedRepository.findByDraftYear(draftYear);
  }

  async getTeamNeedByTeamAndPosition(teamId: number, position: string): Promise<TeamNeed | null> {
    return await this.teamNeedRepository.findByTeamAndPosition(teamId, position);
  }

  async createTeamNeed(
    data: Partial<TeamNeed> & { teamId: number; position: string },
  ): Promise<TeamNeed> {
    // Check if the team already has this position need
    const existingNeed = await this.teamNeedRepository.findByTeamAndPosition(
      data.teamId,
      data.position,
    );
    if (existingNeed) {
      throw new Error(`Team already has a need for position: ${data.position}`);
    }

    const teamNeed = TeamNeed.create(data);
    const errors = teamNeed.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return await this.teamNeedRepository.save(teamNeed);
  }

  async updateTeamNeed(id: number, data: Partial<TeamNeed>): Promise<TeamNeed> {
    const existingNeed = await this.teamNeedRepository.findById(id);
    if (!existingNeed) {
      throw new Error('Team need not found');
    }

    // Check for position uniqueness if changing position
    if (data.position && data.position !== existingNeed.position) {
      const duplicateNeed = await this.teamNeedRepository.findByTeamAndPosition(
        existingNeed.teamId,
        data.position,
      );
      if (duplicateNeed && duplicateNeed.id !== id) {
        throw new Error(`Team already has a need for position: ${data.position}`);
      }
    }

    // Update fields
    Object.assign(existingNeed, data);
    existingNeed.updatedAt = new Date();

    const errors = existingNeed.validate();
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return await this.teamNeedRepository.save(existingNeed);
  }

  async deleteTeamNeed(id: number): Promise<boolean> {
    const existingNeed = await this.teamNeedRepository.findById(id);
    if (!existingNeed) {
      throw new Error('Team need not found');
    }
    return await this.teamNeedRepository.delete(id);
  }

  async incrementPriority(id: number): Promise<TeamNeed> {
    const teamNeed = await this.teamNeedRepository.findById(id);
    if (!teamNeed) {
      throw new Error('Team need not found');
    }

    teamNeed.incrementPriority();
    return await this.teamNeedRepository.save(teamNeed);
  }

  async decrementPriority(id: number): Promise<TeamNeed> {
    const teamNeed = await this.teamNeedRepository.findById(id);
    if (!teamNeed) {
      throw new Error('Team need not found');
    }

    teamNeed.decrementPriority();
    return await this.teamNeedRepository.save(teamNeed);
  }
}
