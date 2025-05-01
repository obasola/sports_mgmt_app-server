// src/modules/postSeasonResult/domain/postSeasonResult.repository.ts
import { PostSeasonResult } from './post-season-result.entity';

export interface PostSeasonResultRepository {
  findAll(): Promise<PostSeasonResult[]>;
  findById(id: number): Promise<PostSeasonResult | null>;
  findByTeamId(teamId: number): Promise<PostSeasonResult[]>;
  findByYear(year: number): Promise<PostSeasonResult[]>;
  findByTeamAndYear(teamId: number, year: number): Promise<PostSeasonResult | null>;
  create(postSeasonResult: PostSeasonResult): Promise<PostSeasonResult>;
  update(postSeasonResult: PostSeasonResult): Promise<PostSeasonResult>;
  delete(id: number): Promise<boolean>;
}

// src/modules/postSeasonResult/application/postSeasonResult.dto.ts
export interface PostSeasonResultDTO {
  id: number;
  playoffYear: number;
  lastRoundReached: string | null;
  winLose: string | null;
  opponentScore: number | null;
  teamScore: number | null;
  teamId: number | null;
}

export interface CreatePostSeasonResultDTO {
  playoffYear: number;
  lastRoundReached: string | null;
  winLose: string | null;
  opponentScore: number | null;
  teamScore: number | null;
  teamId: number | null;
}

export interface UpdatePostSeasonResultDTO {
  playoffYear?: number;
  lastRoundReached?: string | null;
  winLose?: string | null;
  opponentScore?: number | null;
  teamScore?: number | null;
  teamId?: number | null;
}
