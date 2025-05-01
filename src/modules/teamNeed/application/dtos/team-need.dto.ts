// src/modules/teamNeed/application/team-need.dto.ts
export type TeamNeedDTO = {
  id: number;
  teamId: number;
  position: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  draftYear?: Date;
};

export type CreateTeamNeedDTO = {
  teamId: number;
  position: string;
  priority?: number;
  draftYear?: Date;
};

export type UpdateTeamNeedDTO = Partial<CreateTeamNeedDTO>;
