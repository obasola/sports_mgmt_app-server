// sports_mgmt_app_server/src/domain/team/repositories (repo interfaces)
export interface TeamMeta {
  espnTeamId: number
  name: string
  abbreviation: string
  conference: 'AFC' | 'NFC'
  teamId?: number // your internal Team.id if you want it
}

export interface ITeamMetaRepository {
  getAllMeta(): Promise<TeamMeta[]>
}
