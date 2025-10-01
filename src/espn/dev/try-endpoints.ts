import { endpoints } from '../endpoints'
import { getJson } from '../espnClient'
import { upsertEspnTeams } from '../mappers/teamMapper'
import { upsertEspnPlayers } from '../mappers/playerMapper'
import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });


async function main() {
  const teamsRaw = await getJson(endpoints.teams())
  const teamCount = await upsertEspnTeams(teamsRaw)
  console.log(`Upserted ${teamCount} teams into espn_teams`)

  const team = process.env.TEAM ?? 'kc' // allow abbrev or numeric
  const rosterRaw = await getJson(endpoints.teamRoster(team))
  const playerCount = await upsertEspnPlayers(rosterRaw)
  console.log(`Upserted ${playerCount} players for team ${team} into espn_players`)
}

main().catch(err => { console.error(err); process.exit(1) })