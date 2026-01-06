// sports_mgmt_app_server/src/modules/draftSimulator/infrastructure/persistence/prisma/PrismaDraftSimulationRepository.ts
import type { PrismaClient } from '@prisma/client'
import type {
  DraftSimulationRepository,
  CreateSimulationArgs,
  MakePickArgs
} from '../../../domain/repositories/DraftSimulationRepository'
import type { DraftStateDto, DraftPickDto } from '../../../application/dto/DraftStateDto'

export class PrismaDraftSimulationRepository implements DraftSimulationRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async createSimulation(args: CreateSimulationArgs): Promise<DraftStateDto> {
    const sim = await this.prisma.draftSimulation.create({
      data: {
        draftYear: args.draftYear,
        rounds: args.rounds,
        draftSpeed: args.draftSpeed,
        rankingSource: args.rankingSource,
        allowTrades: args.allowTrades,
        cpuCpuTrades: args.cpuCpuTrades,
        status: 'setup',
        currentOverallPick: 1
      }
    })

    if (args.userTeamIds.length > 0) {
      await this.prisma.draftSimulationTeam.createMany({
        data: args.userTeamIds.map((teamId) => ({
          draftSimulationId: sim.id,
          teamId,
          isUserControlled: true
        }))
      })
    }

    return this.getState(sim.id)
  }

  public async startSimulation(simulationId: number): Promise<DraftStateDto> {
    const sim = await this.prisma.draftSimulation.findUnique({ where: { id: simulationId } })
    if (!sim) throw new Error('Simulation not found.')

    const existing = await this.prisma.draftSimulationPick.count({ where: { draftSimulationId: simulationId } })
    if (existing > 0) {
      await this.prisma.draftSimulation.update({
        where: { id: simulationId },
        data: { status: 'live', currentOverallPick: 1 }
      })
      return this.getState(simulationId)
    }

    // pull pick order from your existing DraftPick template table
    const template = await this.prisma.draftPick.findMany({
      where: {
        draftYear: sim.draftYear,
        round: { lte: sim.rounds }
      },
      orderBy: [{ round: 'asc' }, { pickNumber: 'asc' }]
    })

    if (template.length === 0) {
      throw new Error(`DraftPick template missing for draftYear=${sim.draftYear}. Seed DraftPick first.`)
    }

    const rows = template.map((p, idx) => ({
      draftSimulationId: simulationId,
      roundNbr: p.round,
      pickInRound: p.pickNumber,
      overallPick: idx + 1,
      originalTeamId: p.originalTeam ?? p.currentTeamId,
      currentTeamId: p.currentTeamId,
      draftedProspectId: null as number | null,
      draftedAt: null as Date | null
    }))

    await this.prisma.$transaction([
      this.prisma.draftSimulationPick.createMany({ data: rows }),
      this.prisma.draftSimulation.update({
        where: { id: simulationId },
        data: { status: 'live', currentOverallPick: 1 }
      })
    ])

    return this.getState(simulationId)
  }

  public async makePick(args: MakePickArgs): Promise<DraftStateDto> {
    const sim = await this.prisma.draftSimulation.findUnique({ where: { id: args.simulationId } })
    if (!sim) throw new Error('Simulation not found.')
    if (sim.status !== 'live') throw new Error('Simulation is not live.')

    if (args.overallPick !== sim.currentOverallPick) {
      throw new Error(`Pick mismatch. Expected overallPick=${sim.currentOverallPick}.`)
    }

    const pick = await this.prisma.draftSimulationPick.findFirst({
      where: { draftSimulationId: args.simulationId, overallPick: args.overallPick }
    })
    if (!pick) throw new Error('Pick not found.')
    if (pick.draftedProspectId) throw new Error('Pick already used.')

    const already = await this.prisma.draftSimulationPick.findFirst({
      where: { draftSimulationId: args.simulationId, draftedProspectId: args.prospectId },
      select: { id: true }
    })
    if (already) throw new Error('Prospect already drafted in this simulation.')

    await this.prisma.$transaction(async (tx) => {
      await tx.draftSimulationPick.update({
        where: { id: pick.id },
        data: { draftedProspectId: args.prospectId, draftedAt: new Date() }
      })

      const next = await tx.draftSimulationPick.findFirst({
        where: {
          draftSimulationId: args.simulationId,
          overallPick: { gt: args.overallPick },
          draftedProspectId: null
        },
        orderBy: [{ overallPick: 'asc' }]
      })

      if (!next) {
        await tx.draftSimulation.update({
          where: { id: args.simulationId },
          data: { status: 'complete', currentOverallPick: args.overallPick + 1 }
        })
      } else {
        await tx.draftSimulation.update({
          where: { id: args.simulationId },
          data: { currentOverallPick: next.overallPick }
        })
      }
    })

    return this.getState(args.simulationId)
  }

  public async getState(simulationId: number): Promise<DraftStateDto> {
    const sim = await this.prisma.draftSimulation.findUnique({ where: { id: simulationId } })
    if (!sim) throw new Error('Simulation not found.')

    const userTeams = await this.prisma.draftSimulationTeam.findMany({
      where: { draftSimulationId: simulationId, isUserControlled: true },
      select: { teamId: true }
    })

    const picks = await this.prisma.draftSimulationPick.findMany({
      where: { draftSimulationId: simulationId },
      orderBy: [{ overallPick: 'asc' }],
      include: {
        // ✅ Your real relation name for current team
        Team_DraftSimulationPick_currentTeamIdToTeam: { select: { abbreviation: true } },
        // ✅ Your real relation name for drafted prospect
        Prospect: { select: { id: true, firstName: true, lastName: true, position: true, college: true } }
      }
    })

    const pickDtos: DraftPickDto[] = picks.map((p) => ({
      overallPick: p.overallPick,
      roundNbr: p.roundNbr,
      pickInRound: p.pickInRound,
      originalTeamId: p.originalTeamId,
      currentTeamId: p.currentTeamId,
      currentTeamAbbr: p.Team_DraftSimulationPick_currentTeamIdToTeam?.abbreviation ?? null,
      draftedProspectId: p.draftedProspectId ?? null,
      draftedAt: p.draftedAt ? p.draftedAt.toISOString() : null,
      draftedProspect: p.Prospect
        ? {
            id: p.Prospect.id,
            fullName: `${p.Prospect.firstName} ${p.Prospect.lastName}`,
            position: p.Prospect.position,
            college: p.Prospect.college
          }
        : null
    }))

    return {
      simulationId: sim.id,
      draftYear: sim.draftYear,
      rounds: sim.rounds,
      draftSpeed: sim.draftSpeed,
      rankingSource: sim.rankingSource,
      allowTrades: sim.allowTrades,
      cpuCpuTrades: sim.cpuCpuTrades,
      status: sim.status,
      currentOverallPick: sim.currentOverallPick,
      userTeamIds: userTeams.map((t) => t.teamId),
      picks: pickDtos
    }
  }
}
