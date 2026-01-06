// sports_mgmt_app_server/src/modules/draftSimulator/domain/repositories/ProspectRepository.ts
import type { ProspectListItemDto } from '../../application/dto/ProspectListDto'

export interface ProspectFilters {
  q?: string
  side?: 'all' | 'offense' | 'defense' | 'st'
  position?: string
  limit?: number
}

export interface AvailableProspect {
  id: number
  position: string
  overallRank: number
}

export interface ProspectRepository {
  listAvailable(simulationId: number, draftYear: number, rankingSource: string, filters: ProspectFilters): Promise<AvailableProspect[]>
  listForUi(simulationId: number, draftYear: number, rankingSource: string, filters: ProspectFilters): Promise<ProspectListItemDto[]>
}
