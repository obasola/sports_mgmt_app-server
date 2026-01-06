export interface TeamNeedDto {
  id: number;
  teamId: number;
  position: string; // normalized (e.g., "WR")
  priority: number; // 1..5
  draftYear: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TeamNeedSuggestionDto {
  position: string;      // normalized
  priority: number;      // 1..5
  draftYear: number | null;
  reasons: string[];     // human readable
  rosterCount: number;   // count of active/current players at position
  avgAge: number | null; // if available
  expiringCount: number; // contracts ending <= evaluation year
}

export interface TeamNeedsPageDto {
  teamId: number;
  evaluationYear: number;
  persistedNeeds: TeamNeedDto[];
  suggestions: TeamNeedSuggestionDto[];
}

