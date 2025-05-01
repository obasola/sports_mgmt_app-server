import { Request, Response } from 'express';
import { PlayerTeamService } from '../application/player-team.service';
import {
  CreatePlayerTeamDto,
  CreatePlayerTeamSchema,
  UpdatePlayerTeamDto,
  UpdatePlayerTeamSchema,
  TransferPlayerDto,
  TransferPlayerSchema,
  mapPlayerTeamToDto,
} from '../application/dtos/player-team.dto';
import { ZodError } from 'zod';

export class PlayerTeamController {
  private readonly playerTeamService: PlayerTeamService;

  constructor(playerTeamService: PlayerTeamService) {
    this.playerTeamService = playerTeamService;
  }

  /**
   * Get a player-team relationship by id
   */
  async getPlayerTeamById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid player-team ID' });
      return;
    }

    const result = await this.playerTeamService.getPlayerTeamById(id);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const playerTeam = result.getValue();

    if (!playerTeam) {
      res.status(404).json({ error: 'Player-team relationship not found' });
      return;
    }

    res.status(200).json(mapPlayerTeamToDto(playerTeam));
  }

  /**
   * Get team history for a player
   */
  async getTeamHistoryForPlayer(req: Request, res: Response): Promise<void> {
    const playerId = parseInt(req.params.playerId, 10);

    if (isNaN(playerId)) {
      res.status(400).json({ error: 'Invalid player ID' });
      return;
    }

    const result = await this.playerTeamService.getTeamHistoryForPlayer(playerId);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const playerTeams = result.getValue();
    const playerTeamDtos = playerTeams.map(mapPlayerTeamToDto);

    res.status(200).json(playerTeamDtos);
  }

  /**
   * Get player history for a team
   */
  async getPlayerHistoryForTeam(req: Request, res: Response): Promise<void> {
    const teamId = parseInt(req.params.teamId, 10);

    if (isNaN(teamId)) {
      res.status(400).json({ error: 'Invalid team ID' });
      return;
    }

    const result = await this.playerTeamService.getPlayerHistoryForTeam(teamId);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const playerTeams = result.getValue();
    const playerTeamDtos = playerTeams.map(mapPlayerTeamToDto);

    res.status(200).json(playerTeamDtos);
  }

  /**
   * Get current team for a player
   */
  async getCurrentTeamForPlayer(req: Request, res: Response): Promise<void> {
    const playerId = parseInt(req.params.playerId, 10);

    if (isNaN(playerId)) {
      res.status(400).json({ error: 'Invalid player ID' });
      return;
    }

    const result = await this.playerTeamService.getCurrentTeamForPlayer(playerId);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const playerTeam = result.getValue();

    if (!playerTeam) {
      res.status(404).json({ error: 'Player is not currently assigned to any team' });
      return;
    }

    res.status(200).json(mapPlayerTeamToDto(playerTeam));
  }

  /**
   * Get current roster for a team
   */
  async getCurrentRosterForTeam(req: Request, res: Response): Promise<void> {
    const teamId = parseInt(req.params.teamId, 10);

    if (isNaN(teamId)) {
      res.status(400).json({ error: 'Invalid team ID' });
      return;
    }

    const result = await this.playerTeamService.getCurrentRosterForTeam(teamId);

    if (result.isFailure) {
      res.status(500).json({ error: result.error });
      return;
    }

    const playerTeams = result.getValue();
    const playerTeamDtos = playerTeams.map(mapPlayerTeamToDto);

    res.status(200).json(playerTeamDtos);
  }

  /**
   * Add a player to a team
   */
  async addPlayerToTeam(req: Request, res: Response): Promise<void> {
    try {
      const data: CreatePlayerTeamDto = CreatePlayerTeamSchema.parse({
        ...req.body,
        // Convert date strings to Date objects
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      });

      const result = await this.playerTeamService.addPlayerToTeam(
        data.playerId,
        data.teamId,
        data.currentTeam,
        data.startDate,
      );

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const playerTeam = result.getValue();
      res.status(201).json(mapPlayerTeamToDto(playerTeam));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to add player to team', details: (error as Error).message });
      }
    }
  }

  /**
   * Transfer a player to a new team
   */
  async transferPlayer(req: Request, res: Response): Promise<void> {
    try {
      const data: TransferPlayerDto = TransferPlayerSchema.parse({
        ...req.body,
        // Convert date string to Date object
        transferDate: req.body.transferDate ? new Date(req.body.transferDate) : new Date(),
      });

      const result = await this.playerTeamService.transferPlayerToNewTeam(
        data.playerId,
        data.teamId,
        data.transferDate,
      );

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const playerTeam = result.getValue();
      res.status(200).json(mapPlayerTeamToDto(playerTeam));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res
          .status(500)
          .json({ error: 'Failed to transfer player', details: (error as Error).message });
      }
    }
  }

  /**
   * Remove a player from their current team
   */
  async removePlayerFromTeam(req: Request, res: Response): Promise<void> {
    const playerId = parseInt(req.params.playerId, 10);

    if (isNaN(playerId)) {
      res.status(400).json({ error: 'Invalid player ID' });
      return;
    }

    const result = await this.playerTeamService.removePlayerFromCurrentTeam(playerId);

    if (result.isFailure) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(200).json({ message: 'Player removed from current team successfully' });
  }

  /**
   * Update a player-team relationship
   */
  async updatePlayerTeam(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid player-team ID' });
        return;
      }

      const data: UpdatePlayerTeamDto = UpdatePlayerTeamSchema.parse({
        ...req.body,
        // Convert date strings to Date objects
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      });

      const result = await this.playerTeamService.updatePlayerTeam(id, data);

      if (result.isFailure) {
        res.status(400).json({ error: result.error });
        return;
      }

      const playerTeam = result.getValue();
      res.status(200).json(mapPlayerTeamToDto(playerTeam));
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        res.status(500).json({
          error: 'Failed to update player-team relationship',
          details: (error as Error).message,
        });
      }
    }
  }

  /**
   * Delete a player-team relationship
   */
  async deletePlayerTeam(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid player-team ID' });
      return;
    }

    const result = await this.playerTeamService.deletePlayerTeam(id);

    if (result.isFailure) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(204).send();
  }
}
