// sports_mgmt_app_server/src/modules/draftSimulator/domain/repositories/TeamNeedRepository.ts
export interface TeamNeedWeight {
  position: string
  weight: number // 1..5
}

export interface TeamNeedRepository {
  getTeamNeedWeights(teamId: number, draftYear: number): Promise<TeamNeedWeight[]>
}

export interface TeamNeedWeight {
  position: string
  weight: number // 1..5
}

export interface TeamNeedPriority {
  position: string
  priority: number // 1..5 (1 is highest)
}

export interface TeamNeedRepository {
  getTeamNeedWeights(teamId: number, draftYear: number): Promise<TeamNeedWeight[]>

  // ✅ new: for UI console
  listTopNeeds(teamId: number, draftYear: number, limit: number): Promise<TeamNeedPriority[]>
}
