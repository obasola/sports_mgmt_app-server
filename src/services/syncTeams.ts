// ================================================
// src/services/syncTeams.ts
// ================================================
import axios from 'axios';
import { prisma } from "@/infrastructure/database/prisma";
import { IJobLogger } from '@/jobs/IJobLogger';



export class SyncTeamsService {
  constructor(private readonly job: IJobLogger) {}

  async fetchEspnTeams() {
    const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams';
    console.log('(SyncTeamsService) Fetching:', url);

    const { data } = await axios.get(url);
    const teams = data?.sports?.[0]?.leagues?.[0]?.teams ?? [];

    if (!teams.length) {
      throw new Error('Unable to obtain NFL teams from ESPN — no results.');
    }

    return teams.map((t: any) => ({
      espnTeamId: Number(t.team.id),
      name: t.team.displayName,
      abbreviation: t.team.abbreviation,
      logoUrl: t.team.logos?.[0]?.href ?? null,
    }));
  }

  async run() {
    const { jobId } = await this.job.start({ jobType: 'SYNC_TEAMS' });

    try {
      const espnTeams = await this.fetchEspnTeams();

      for (const t of espnTeams) {
        await prisma.team.upsert({
          where: { abbreviation: t.abbreviation },
          update: {
            espnTeamId: t.espnTeamId,
            name: t.name,
          },
          create: {
            espnTeamId: t.espnTeamId,
            abbreviation: t.abbreviation,
            name: t.name,
          },
        });
      }

      console.log(`✅ Synced ${espnTeams.length} NFL teams`);
      await this.job.succeed(jobId, { total: espnTeams.length });
    } catch (err: any) {
      console.error('❌ syncTeams failed:', err.message ?? err);
      await this.job.fail(jobId, err.message ?? 'Sync failed');
      throw err;
    }
  }
}
