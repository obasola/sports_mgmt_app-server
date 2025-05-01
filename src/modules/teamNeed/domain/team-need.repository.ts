// src/modules/teamNeed/domain/team-need.repository.ts
import { TeamNeed } from './team-need.entity';

export interface TeamNeedRepository {
  findAll(): Promise<TeamNeed[]>;
  findById(id: number): Promise<TeamNeed | null>;
  findByTeamId(teamId: number): Promise<TeamNeed[]>;
  findByPosition(position: string): Promise<TeamNeed[]>;
  findByPriority(priority: number): Promise<TeamNeed[]>;
  findByDraftYear(draftYear: Date): Promise<TeamNeed[]>;
  findByTeamAndPosition(teamId: number, position: string): Promise<TeamNeed | null>;
  save(teamNeed: TeamNeed): Promise<TeamNeed>;
  delete(id: number): Promise<boolean>;
}
