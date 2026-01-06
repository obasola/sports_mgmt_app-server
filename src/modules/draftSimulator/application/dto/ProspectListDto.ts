// sports_mgmt_app_server/src/modules/draftSimulator/application/dto/ProspectListDto.ts
export interface ProspectListItemDto {
  id: number
  fullName: string
  position: string
  college: string
  overallRank: number
  grade: number | null
}
