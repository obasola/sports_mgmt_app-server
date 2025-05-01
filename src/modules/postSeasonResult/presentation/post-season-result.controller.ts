// src/modules/postSeasonResult/presentation/postSeasonResult.controller.ts
import { Request, Response } from 'express';
import { PostSeasonResultService } from '../application/post-season-result.service';
import {
  CreatePostSeasonResultDTO,
  UpdatePostSeasonResultDTO,
} from '../application/dtos/post-season-result.dto';

export class PostSeasonResultController {
  constructor(private postSeasonResultService: PostSeasonResultService) {}

  async getAllPostSeasonResults(req: Request, res: Response): Promise<void> {
    try {
      const results = await this.postSeasonResultService.getAllPostSeasonResults();
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post-season results', error });
    }
  }

  async getPostSeasonResultById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.postSeasonResultService.getPostSeasonResultById(id);

      if (!result) {
        res.status(404).json({ message: 'Post-season result not found' });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post-season result', error });
    }
  }

  async getPostSeasonResultsByTeamId(req: Request, res: Response): Promise<void> {
    try {
      const teamId = parseInt(req.params.teamId);
      const results = await this.postSeasonResultService.getPostSeasonResultsByTeamId(teamId);
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post-season results', error });
    }
  }

  async getPostSeasonResultsByYear(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.params.year);
      const results = await this.postSeasonResultService.getPostSeasonResultsByYear(year);
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post-season results', error });
    }
  }

  async getPostSeasonResultByTeamAndYear(req: Request, res: Response): Promise<void> {
    try {
      const teamId = parseInt(req.params.teamId);
      const year = parseInt(req.params.year);
      const result = await this.postSeasonResultService.getPostSeasonResultByTeamAndYear(
        teamId,
        year,
      );

      if (!result) {
        res.status(404).json({ message: 'Post-season result not found' });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post-season result', error });
    }
  }

  async createPostSeasonResult(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreatePostSeasonResultDTO = req.body;
      const result = await this.postSeasonResultService.createPostSeasonResult(dto);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating post-season result', error });
    }
  }

  async updatePostSeasonResult(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const dto: UpdatePostSeasonResultDTO = req.body;

      const result = await this.postSeasonResultService.updatePostSeasonResult(id, dto);

      if (!result) {
        res.status(404).json({ message: 'Post-season result not found' });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating post-season result', error });
    }
  }

  async deletePostSeasonResult(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.postSeasonResultService.deletePostSeasonResult(id);

      if (!result) {
        res.status(404).json({ message: 'Post-season result not found' });
        return;
      }

      res.status(200).json({ message: 'Post-season result deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting post-season result', error });
    }
  }
}
