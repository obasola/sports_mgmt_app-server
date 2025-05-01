import { Request, Response } from 'express';
import { PlayerService } from '../application/player.service';
import {
  CreatePlayerDto,
  CreatePlayerSchema,
  PlayerFilterDto,
  PlayerFilterSchema,
  UpdatePlayerDto,
  UpdatePlayerSchema,
  mapPlayerToDto,
} from '../application/dtos/player.dto';
import { ZodError } from 'zod';

export class PlayerController {
  private readonly playerService: PlayerService;

  constructor(playerService: PlayerService) {
    this.playerService = playerService;
  }

  /**
   * Get a player by id
   */
  async getPlayerById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid player ID' });
      return;
    }

    const result = await this.playerService.getPlayerById(id);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const player = result.getValue();

    if (!player) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    res.status(200).json(mapPlayerToDto(player));
  }

  /**
   * Get all players with optional pagination
   */
  async getAllPlayers(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    if ((limit !== undefined && isNaN(limit)) || (offset !== undefined && isNaN(offset))) {
      res.status(400).json({ error: 'Invalid pagination parameters' });
      return;
    }

    const result = await this.playerService.getAllPlayers(limit, offset);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const players = result.getValue();
    const playerDtos = players.map(mapPlayerToDto);

    res.status(200).json(playerDtos);
  }

  /**
   * Create a new player
   */
  async createPlayer(req: Request, res: Response): Promise<void> {
    try {
      const playerData: CreatePlayerDto = CreatePlayerSchema.parse(req.body);

      // Handle date conversion
      if (req.body.yearEnteredLeague && typeof req.body.yearEnteredLeague === 'string') {
        playerData.yearEnteredLeague = new Date(req.body.yearEnteredLeague);
      }

      const result = await this.playerService.createPlayer(playerData);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const createdPlayer = result.getValue();
      res.status(201).json(mapPlayerToDto(createdPlayer));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to create player', details: (error as Error).message });
      }
    }
  }

  /**
   * Update an existing player
   */
  async updatePlayer(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid player ID' });
        return;
      }

      const playerData: UpdatePlayerDto = UpdatePlayerSchema.parse(req.body);

      // Handle date conversion
      if (req.body.yearEnteredLeague && typeof req.body.yearEnteredLeague === 'string') {
        playerData.yearEnteredLeague = new Date(req.body.yearEnteredLeague);
      }

      const result = await this.playerService.updatePlayer(id, playerData as any);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const updatedPlayer = result.getValue();
      res.status(200).json(mapPlayerToDto(updatedPlayer));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to update player', details: (error as Error).message });
      }
    }
  }

  /**
   * Delete a player
   */
  async deletePlayer(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid player ID' });
      return;
    }

    const result = await this.playerService.deletePlayer(id);

    if (result.isFailure) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(204).send();
  }

  /**
   * Get players by team
   */
  async getPlayersByTeam(req: Request, res: Response): Promise<void> {
    const teamId = parseInt(req.params.teamId, 10);

    if (isNaN(teamId)) {
      res.status(400).json({ error: 'Invalid team ID' });
      return;
    }

    const result = await this.playerService.getPlayersByTeam(teamId);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const players = result.getValue();
    const playerDtos = players.map(mapPlayerToDto);

    res.status(200).json(playerDtos);
  }

  /**
   * Get players by filters
   */
  async getPlayersByFilters(req: Request, res: Response): Promise<void> {
    try {
      const filters: PlayerFilterDto = PlayerFilterSchema.parse(req.query);

      // Parse numeric query parameters
      if (req.query.ageMin && typeof req.query.ageMin === 'string') {
        filters.ageMin = parseInt(req.query.ageMin, 10);
      }

      if (req.query.ageMax && typeof req.query.ageMax === 'string') {
        filters.ageMax = parseInt(req.query.ageMax, 10);
      }

      const result = await this.playerService.getPlayersByFilters(filters);

      if (result.isFailure) {
        res.status(500).json({ error: result.error });
        return;
      }

      const players = result.getValue();
      const playerDtos = players.map(mapPlayerToDto);

      res.status(200).json(playerDtos);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to get players by filters', details: (error as Error).message });
      }
    }
  }
}
