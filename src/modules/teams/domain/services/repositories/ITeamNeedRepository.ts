import { TeamNeedDto } from "../../dtos/TeamNeedDtos";

export interface UpsertTeamNeedInput {
  teamId: number;
  position: string;
  priority: number;
  draftYear: number | null;
}

export interface ITeamNeedRepository {
  listByTeamId(teamId: number): Promise<TeamNeedDto[]>;
  upsert(input: UpsertTeamNeedInput): Promise<TeamNeedDto>;
  deleteByTeamIdAndPosition(teamId: number, position: string): Promise<void>;
}

