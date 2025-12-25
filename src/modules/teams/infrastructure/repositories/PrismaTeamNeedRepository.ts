import { PrismaClient } from "@prisma/client";
import { ITeamNeedRepository, UpsertTeamNeedInput } from "../../domain/services/repositories/ITeamNeedRepository";
import { TeamNeedDto } from "../../domain/dtos/TeamNeedDtos";

export class PrismaTeamNeedRepository implements ITeamNeedRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listByTeamId(teamId: number): Promise<TeamNeedDto[]> {
    const rows = await this.prisma.teamNeed.findMany({
      where: { teamId },
      orderBy: [{ priority: "desc" }, { position: "asc" }]
    });

    return rows.map((r) => ({
      id: r.id,
      teamId: r.teamId,
      position: r.position,
      priority: r.priority,
      draftYear: r.draftYear ?? null,
      createdAt: r.createdAt ? r.createdAt.toISOString() : null,
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null
    }));
    }

  public async upsert(input: UpsertTeamNeedInput): Promise<TeamNeedDto> {
    const row = await this.prisma.teamNeed.upsert({
      where: { teamId_position: { teamId: input.teamId, position: input.position } },
      create: {
        teamId: input.teamId,
        position: input.position,
        priority: input.priority,
        draftYear: input.draftYear ?? undefined
      },
      update: {
        priority: input.priority,
        draftYear: input.draftYear ?? undefined
      }
    });

    return {
      id: row.id,
      teamId: row.teamId,
      position: row.position,
      priority: row.priority,
      draftYear: row.draftYear ?? null,
      createdAt: row.createdAt ? row.createdAt.toISOString() : null,
      updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null
    };
  }

  public async deleteByTeamIdAndPosition(teamId: number, position: string): Promise<void> {
    await this.prisma.teamNeed.delete({
      where: { teamId_position: { teamId, position } }
    });
  }
}

