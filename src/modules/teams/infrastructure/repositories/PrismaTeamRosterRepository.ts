import { PrismaClient } from "@prisma/client";
import { ITeamRosterRepository, RosterPlayer } from "../../domain/services/repositories/ITeamRosterRepository";

export class PrismaTeamRosterRepository implements ITeamRosterRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async getCurrentRoster(teamId: number): Promise<RosterPlayer[]> {
    const rows = await this.prisma.playerTeam.findMany({
      where: { teamId, currentTeam: true },
      include: { Player: true }
    });

    return rows.map((pt) => ({
      playerId: pt.playerId,
      firstName: pt.Player.firstName,
      lastName: pt.Player.lastName,
      age: Number.isFinite(pt.Player.age) ? pt.Player.age : null,
      position: pt.Player.position ?? null,
      currentTeam: pt.currentTeam,
      isActive: pt.isActive ?? null,
      startYear: pt.startYear ?? null,
      endYear: pt.endYear ?? null
    }));
  }
}


