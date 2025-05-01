import { PostSeasonResult } from '../domain/post-season-result.entity';
import { PostSeasonResultRepository } from '../domain/post-season-result.repository';
import {
  CreatePostSeasonResultDTO,
  UpdatePostSeasonResultDTO,
  PostSeasonResultDTO,
} from './dtos/post-season-result.dto';

export class PostSeasonResultService {
  constructor(private postSeasonResultRepository: PostSeasonResultRepository) {}

  async getAllPostSeasonResults(): Promise<PostSeasonResultDTO[]> {
    const results = await this.postSeasonResultRepository.findAll();
    return results.map(result => result.toObject() as PostSeasonResultDTO);
  }

  async getPostSeasonResultById(id: number): Promise<PostSeasonResultDTO | null> {
    const result = await this.postSeasonResultRepository.findById(id);
    return result ? (result.toObject() as PostSeasonResultDTO) : null;
  }

  async getPostSeasonResultsByTeamId(teamId: number): Promise<PostSeasonResultDTO[]> {
    const results = await this.postSeasonResultRepository.findByTeamId(teamId);
    return results.map(result => result.toObject() as PostSeasonResultDTO);
  }

  async getPostSeasonResultsByYear(year: number): Promise<PostSeasonResultDTO[]> {
    const results = await this.postSeasonResultRepository.findByYear(year);
    return results.map(result => result.toObject() as PostSeasonResultDTO);
  }

  async getPostSeasonResultByTeamAndYear(
    teamId: number,
    year: number,
  ): Promise<PostSeasonResultDTO | null> {
    const result = await this.postSeasonResultRepository.findByTeamAndYear(teamId, year);
    return result ? (result.toObject() as PostSeasonResultDTO) : null;
  }

  async createPostSeasonResult(dto: CreatePostSeasonResultDTO): Promise<PostSeasonResultDTO> {
    const postSeasonResult = PostSeasonResult.create({
      id: 0, // or however you handle new IDs
      playoffYear: dto.playoffYear,
      lastRoundReached: dto.lastRoundReached === null ? '' : dto.lastRoundReached,
      winLose: dto.winLose === null ? '' : dto.winLose,
      opponentScore: dto.opponentScore === null ? 0 : dto.opponentScore,
      teamScore: dto.teamScore === null ? 0 : dto.teamScore,
      teamId: dto.teamId === null ? 0 : dto.teamId,
    });

    const createdResult = await this.postSeasonResultRepository.create(postSeasonResult);
    return createdResult.toObject() as PostSeasonResultDTO;
  }

  async updatePostSeasonResult(
    id: number,
    dto: UpdatePostSeasonResultDTO,
  ): Promise<PostSeasonResultDTO | null> {
    const existingResult = await this.postSeasonResultRepository.findById(id);
    if (!existingResult) {
      return null;
    }

    if (dto.playoffYear !== undefined) {
      existingResult.playoffYear = dto.playoffYear;
    }
    if (dto.lastRoundReached !== undefined) {
      existingResult.lastRoundReached = dto.lastRoundReached;
    }
    if (dto.winLose !== undefined) {
      existingResult.winLose = dto.winLose;
    }
    if (dto.opponentScore !== undefined) {
      existingResult.opponentScore = dto.opponentScore;
    }
    if (dto.teamScore !== undefined) {
      existingResult.teamScore = dto.teamScore;
    }
    if (dto.teamId !== undefined) {
      existingResult.teamId = dto.teamId;
    }

    const updatedResult = await this.postSeasonResultRepository.update(existingResult);
    return updatedResult.toObject() as PostSeasonResultDTO;
  }

  async deletePostSeasonResult(id: number): Promise<boolean> {
    return await this.postSeasonResultRepository.delete(id);
  }
}
