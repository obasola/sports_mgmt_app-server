import { Request, Response } from 'express';
import { TeamNeedService } from '../application/team-need.service';

export class TeamNeedController {
  constructor(private teamNeedService: TeamNeedService) {}

  async getAllTeamNeeds(req: Request, res: Response): Promise<void> {
    try {
      const teamNeeds = await this.teamNeedService.getAllTeamNeeds();
      res.status(200).json(teamNeeds);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.log('An unknown error occurred');
      }
    }
  }

  async getTeamNeedById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const teamNeed = await this.teamNeedService.getTeamNeedById(id);

      if (!teamNeed) {
        res.status(404).json({ message: 'Team need not found' });
        return;
      }

      res.status(200).json(teamNeed);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.log('An unknown error occurred');
      }
    }
  }

  async getTeamNeedsByTeamId(req: Request, res: Response): Promise<void> {
    try {
      const teamId = parseInt(req.params.teamId);
      const teamNeeds = await this.teamNeedService.getTeamNeedsByTeamId(teamId);
      res.status(200).json(teamNeeds);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.log('An unknown error occurred');
      }
    }
  }

  async createTeamNeed(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      if (data.draftYear && typeof data.draftYear === 'string') {
        data.draftYear = new Date(data.draftYear);
      }

      const teamNeed = await this.teamNeedService.createTeamNeed(data);
      res.status(201).json(teamNeed);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.log('An unknown error occurred');
      }
    }
  }

  async updateTeamNeed(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;

      if (data.draftYear && typeof data.draftYear === 'string') {
        data.draftYear = new Date(data.draftYear);
      }

      const teamNeed = await this.teamNeedService.updateTeamNeed(id, data);
      res.status(200).json(teamNeed);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.log('An unknown error occurred');
      }
    }
  }

  async deleteTeamNeed(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await this.teamNeedService.deleteTeamNeed(id);
      res.status(200).json({ message: 'Team need deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.log('An unknown error occurred');
      }
    }
  }

  async incrementPriority(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const teamNeed = await this.teamNeedService.incrementPriority(id);
      res.status(200).json(teamNeed);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.log('An unknown error occurred');
      }
    }
  }

  async decrementPriority(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const teamNeed = await this.teamNeedService.decrementPriority(id);
      res.status(200).json(teamNeed);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        console.log('An unknown error occurred');
      }
    }
  }
}
