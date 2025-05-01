import { Team } from '../domain/team.entity';
import { TeamRepository } from '../domain/team.repository';
import { Result } from '../../../shared/domain/Result';

export class TeamService {
  private readonly teamRepository: TeamRepository;

  constructor(teamRepository: TeamRepository) {
    this.teamRepository = teamRepository;
  }

  /**
   * Get a team by id
   */
  async getTeamById(id: number): Promise<Result<Team | null>> {
    return await this.teamRepository.findById(id);
  }

  /**
   * Get all teams
   */
  async getAllTeams(): Promise<Result<Team[]>> {
    return await this.teamRepository.findAll();
  }

  /**
   * Create a new team
   */
  async createTeam(teamData: {
    name: string;
    city?: string;
    state?: string;
    conference?: string;
    division?: string;
    stadium?: string;
    scheduleId?: number;
  }): Promise<Result<Team>> {
    const teamResult = Team.create(teamData);

    if (teamResult.isFailure) {
      return Result.fail<Team>(teamResult.error as string);
    }

    const team = teamResult.getValue();
    return await this.teamRepository.create(team);
  }

  /**
   * Update an existing team
   */
  async updateTeam(
    id: number,
    teamData: {
      name: string;
      city?: string;
      state?: string;
      conference?: string;
      division?: string;
      stadium?: string;
      scheduleId?: number;
    },
  ): Promise<Result<Team>> {
    // Check if team exists
    const existingTeamResult = await this.teamRepository.findById(id);

    if (existingTeamResult.isFailure) {
      return Result.fail<Team>(existingTeamResult.error as string);
    }

    const existingTeam = existingTeamResult.getValue();
    if (!existingTeam) {
      return Result.fail<Team>(`Team with ID ${id} not found`);
    }

    // Create updated team entity
    const teamResult = Team.create({
      id,
      ...teamData,
    });

    if (teamResult.isFailure) {
      return Result.fail<Team>(teamResult.error as string);
    }

    const team = teamResult.getValue();
    return await this.teamRepository.update(id, team);
  }

  /**
   * Delete a team by id
   */
  async deleteTeam(id: number): Promise<Result<boolean>> {
    // Check if team exists
    const existingTeamResult = await this.teamRepository.findById(id);

    if (existingTeamResult.isFailure) {
      return Result.fail<boolean>(existingTeamResult.error as string);
    }

    const existingTeam = existingTeamResult.getValue();
    if (!existingTeam) {
      return Result.fail<boolean>(`Team with ID ${id} not found`);
    }

    return await this.teamRepository.delete(id);
  }

  /**
   * Get teams by conference
   */
  async getTeamsByConference(conference: string): Promise<Result<Team[]>> {
    return await this.teamRepository.findByFilters({ conference });
  }

  /**
   * Get teams by division
   */
  async getTeamsByDivision(division: string): Promise<Result<Team[]>> {
    return await this.teamRepository.findByFilters({ division });
  }

  /**
   * Get teams by conference and division
   */
  async getTeamsByConferenceAndDivision(
    conference: string,
    division?: string,
  ): Promise<Result<Team[]>> {
    return await this.teamRepository.findByConferenceAndDivision(conference, division);
  }

  /**
   * Find team by name
   */
  async getTeamByName(name: string): Promise<Result<Team | null>> {
    return await this.teamRepository.findByName(name);
  }

  /**
   * Get teams by filters
   */
  async getTeamsByFilters(filters: {
    conference?: string;
    division?: string;
  }): Promise<Result<Team[]>> {
    return await this.teamRepository.findByFilters(filters);
  }
}
