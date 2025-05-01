// src/modules/postSeasonResult/application/dtos/post-season-result.dto.ts
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
