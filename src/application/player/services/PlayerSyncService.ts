// src/application/player/services/PlayerSyncService.ts
import { EspnPlayerClient } from '@/infrastructure/espn/EspnPlayerClient';
import { IPlayerRepository } from '@/domain/player/repositories/IPlayerRepository';
import { IPlayerTeamRepository } from '@/domain/playerTeam/repositories/IPlayerTeamRepository';
import { Player } from '@/domain/player/entities/Player';
import { PlayerTeam } from '@/domain/playerTeam/entities/PlayerTeam';
import { prisma } from "@/infrastructure/database/prisma";
import { IJobLogger } from '@/jobs/IJobLogger';

export class PlayerSyncService {
  constructor(
    private espn: EspnPlayerClient,
    private playerRepo: IPlayerRepository,
    private playerTeamRepo: IPlayerTeamRepository,
  
    private job: IJobLogger
  ) {}

  async runAllTeams(): Promise<{ teams: number; players: number }> {
    const { jobId } = await this.job.start({
      jobType: 'PLAYER_SYNC',
      params: { scope: 'ALL' },
    });

    try {
      const teams = await this.espn.listTeams();
      let totalPlayers = 0;
      let totalTeams = 0;

      for (const item of teams.items ?? []) {
        const teamEspnId = this.extractId(item.$ref);
        if (!teamEspnId) continue;
        const { players } = await this.runTeam(Number(teamEspnId), jobId);
        totalPlayers += players;
        totalTeams++;
      }

      await this.job.succeed(jobId, { totalPlayers, totalTeams });
      return { teams: totalTeams, players: totalPlayers };
    } catch (err: any) {
      await this.job.fail(jobId, err?.message ?? String(err));
      throw err;
    }
  }

  async runTeam(teamEspnId: number, parentJobId?: number): Promise<{ players: number }> {
    const { jobId } = parentJobId
      ? { jobId: parentJobId }
      : await this.job.start({ jobType: 'PLAYER_SYNC', params: { teamEspnId } });

    try {
      const athletes = await this.espn.listTeamAthletes(teamEspnId);
      const localTeam = await prisma.team.findFirst({
        where: { espnTeamId: teamEspnId },
      });
      if (!localTeam) throw new Error(`No local team for espnTeamId=${teamEspnId}`);

      let upsertCount = 0;
      for (const it of athletes.items ?? []) {
        // ESPN Core vs Site inline data
        let athlete: any;
        if (it.$ref) {
          try {
            athlete = await this.espn.getAthlete(it.$ref);
          } catch (e) {
            await this.job.log(jobId, {
              message: `Skipping athlete ref ${it.$ref}: ${e instanceof Error ? e.message : e}`,
            });
            continue;
          }
        } else {
          // Site API inline object
          athlete = it;
        }

        // --- Map to Player entity ---
        const player = this.mapAthleteToPlayer(athlete);
        const saved = await this.playerRepo.upsertByEspnId(player);

        // --- Map to PlayerTeam entity ---
        const join = PlayerTeam.create({
          playerId: saved.id!,
          teamId: localTeam.id,
          jerseyNumber: athlete.jersey ? Number(athlete.jersey) : undefined,
          currentTeam: true, // active row
          isActive: true,
          startYear: 0,
          endYear: 0,
          // endDate: null,
          contractValue: undefined, // leave for manual enrichment
          contractLength: undefined,
        });

        await this.playerTeamRepo.upsertCurrent(join);
        upsertCount++;
      }

      await this.job.log(jobId, {
        //  level: 'info',
        message: `Synced ${upsertCount} players for team ${teamEspnId}`,
      });

      if (!parentJobId) await this.job.succeed(jobId, { teamEspnId, upserts: upsertCount });

      return { players: upsertCount };
    } catch (err: any) {
      await this.job.fail(jobId, err?.message ?? String(err));
      throw err;
    }
  }

  private extractId(ref: string | undefined): number | null {
    if (!ref) return null;
    const match = ref.match(/\/teams\/(\d+)/);
    return match ? Number(match[1]) : null;
  }

  private mapAthleteToPlayer(ath: any): Player {
    const firstName = ath.firstName ?? '';
    const lastName = ath.lastName ?? '';
    const fullName = ath.fullName ?? `${firstName} ${lastName}`.trim();
    const pos = ath.position?.abbreviation ?? ath.position?.name ?? null;
    const status = ath.status?.type ?? null;
    const birthDate = ath.dateOfBirth ? new Date(ath.dateOfBirth) : null;
    const height = ath.height ? this.normalizeHeight(ath.height) : null;
    const weight = ath.weight ? this.normalizeWeight(ath.weight) : null;

    return Player.create({
      espnAthleteId: String(ath.id),
      firstName,
      lastName,
      position: pos,
      status,
      age: 0,
      height: ath.height ? this.normalizeHeight(ath.height) : undefined,
      weight: ath.weight ? this.normalizeWeight(ath.weight) : undefined,
    });
  }

  private normalizeHeight(value: number): number {
    // Core API sometimes returns cm; if over 100, assume cm → inches
    return value > 100 ? Math.round(value / 2.54) : value;
  }

  private normalizeWeight(value: number): number {
    // Core API sometimes returns kg; if < 200, assume kg → lbs
    return value < 200 ? Math.round(value * 2.205) : value;
  }
}
