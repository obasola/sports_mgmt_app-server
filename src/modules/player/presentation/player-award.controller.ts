// src/modules/playerAward/presentation/playerAward.controller.ts
import { Request, Response } from 'express';

import { CreatePlayerAwardDTO, UpdatePlayerAwardDTO } from '../application/dtos/player-award.dto';
import { PlayerAwardService } from '../application/player-award.service';

export class PlayerAwardController {
  constructor(private playerAwardService: PlayerAwardService) {}

  async getAllPlayerAwards(req: Request, res: Response): Promise<void> {
    try {
      const playerAwards = await this.playerAwardService.getAll();
      res.status(200).json(playerAwards);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching player awards', error });
    }
  }

  async getPlayerAwardById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const playerAward = await this.playerAwardService.getById(id);

      if (!playerAward) {
        res.status(404).json({ message: 'Player award not found' });
        return;
      }

      res.status(200).json(playerAward);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching player award', error });
    }
  }

  async getPlayerAwardsByPlayerId(req: Request, res: Response): Promise<void> {
    try {
      const playerId = parseInt(req.params.playerId);
      const playerAwards = await this.playerAwardService.getPlayerAwardsByPlayerId(playerId);
      res.status(200).json(playerAwards);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching player awards', error });
    }
  }

  async createPlayerAward(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreatePlayerAwardDTO = req.body;
      const playerAward = await this.playerAwardService.create(dto);
      res.status(201).json(playerAward);
    } catch (error) {
      res.status(500).json({ message: 'Error creating player award', error });
    }
  }

  async updatePlayerAward(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const dto: UpdatePlayerAwardDTO = req.body;

      const playerAward = await this.playerAwardService.update(id, dto);

      if (!playerAward) {
        res.status(404).json({ message: 'Player award not found' });
        return;
      }

      res.status(200).json(playerAward);
    } catch (error) {
      res.status(500).json({ message: 'Error updating player award', error });
    }
  }

  async deletePlayerAward(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await this.playerAwardService.delete(id);
      /*
      if (!result) {
        res.status(404).json({ message: 'Player award not found' });
        return;
      }
      */
      res.status(200).json({ message: 'Player award deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting player award', error });
    }
  }
}
