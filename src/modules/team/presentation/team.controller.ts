import { Request, Response } from 'express';
import { TeamService } from '../application/team.service';
import {
  CreateTeamDto,
  CreateTeamSchema,
  TeamFilterDto,
  TeamFilterSchema,
  UpdateTeamDto,
  UpdateTeamSchema,
  mapTeamToDto,
} from '../application/dtos/team.dto';
import { ZodError } from 'zod';

export class TeamController {
  private readonly teamService: TeamService;

  constructor(teamService: TeamService) {
    this.teamService = teamService;
  }

  /**
   * Get a team by id
   */
  async getTeamById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid team ID' });
      return;
    }

    const result = await this.teamService.getTeamById(id);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const team = result.getValue();

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    res.status(200).json(mapTeamToDto(team));
  }

  /**
   * Get all teams
   */
  async getAllTeams(req: Request, res: Response): Promise<void> {
    const result = await this.teamService.getAllTeams();

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const teams = result.getValue();
    const teamDtos = teams.map(mapTeamToDto);

    res.status(200).json(teamDtos);
  }

  /**
   * Create a new team
   */
  async createTeam(req: Request, res: Response): Promise<void> {
    try {
      const teamData: CreateTeamDto = CreateTeamSchema.parse(req.body);
      const result = await this.teamService.createTeam(teamData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const createdTeam = result.getValue();
      res.status(201).json(mapTeamToDto(createdTeam));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create team', details: (error as Error).message });
      }
    }
  }

  /**
   * Update an existing team
   */
  async updateTeam(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid team ID' });
        return;
      }

      const teamData: UpdateTeamDto = UpdateTeamSchema.parse(req.body);
      const result = await this.teamService.updateTeam(id, teamData as any);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedTeam = result.getValue();
      res.status(200).json(mapTeamToDto(updatedTeam));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to update team', details: (error as Error).message });
      }
    }
  }

  /**
   * Delete a team
   */
  async deleteTeam(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid team ID' });
      return;
    }

    const result = await this.teamService.deleteTeam(id);

    if (result.isFailure) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(204).send();
  }

  /**
   * Get a team by name
   */
  async getTeamByName(req: Request, res: Response): Promise<void> {
    const name = req.params.name;

    if (!name) {
      res.status(400).json({ error: 'Team name is required' });
      return;
    }

    const result = await this.teamService.getTeamByName(name);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const team = result.getValue();

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    res.status(200).json(mapTeamToDto(team));
  }

  /**
   * Get teams by conference and/or division
   */
  async getTeamsByConferenceAndDivision(req: Request, res: Response): Promise<void> {
    const conference = req.params.conference;
    const division = req.query.division as string | undefined;

    if (!conference) {
      res.status(400).json({ error: 'Conference is required' });
      return;
    }

    const result = await this.teamService.getTeamsByConferenceAndDivision(conference, division);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const teams = result.getValue();
    const teamDtos = teams.map(mapTeamToDto);

    res.status(200).json(teamDtos);
  }

  /**
   * Get teams by filters
   */
  async getTeamsByFilters(req: Request, res: Response): Promise<void> {
    try {
      const filters: TeamFilterDto = TeamFilterSchema.parse(req.query);
      const result = await this.teamService.getTeamsByFilters(filters);

      if (result.isFailure) {
        res.status(500).json({ error: result.error });
        return;
      }

      const teams = result.getValue();
      const teamDtos = teams.map(mapTeamToDto);

      res.status(200).json(teamDtos);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to get teams by filters', details: (error as Error).message });
      }
    }
  }
}
