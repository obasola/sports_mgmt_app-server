// src/infrastructure/repositories/PrismaPlayerTeamRepository.ts
import {
  IPlayerTeamRepository,
  PlayerTeamFilters,
} from '@/domain/playerTeam/repositories/IPlayerTeamRepository';
import { PlayerTeam } from '@/domain/playerTeam/entities/PlayerTeam';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { NotFoundError } from '@/shared/errors/AppError';
import { prisma } from '../database/prisma';
import { Prisma } from '@prisma/client';

export class PrismaPlayerTeamRepository implements IPlayerTeamRepository {
  async save(playerTeam: PlayerTeam): Promise<PlayerTeam> {
    const data = playerTeam.toPersistence();
    const { id, ...createData } = data;

    // Build create data with required fields, ensuring they exist
    if (!createData.playerId || !createData.teamId) {
      throw new Error('playerId and teamId are required for creating PlayerTeam');
    }

    // Use proper Prisma type for create data
    const cleanCreateData: Prisma.PlayerTeamUncheckedCreateInput = {
      playerId: createData.playerId,
      teamId: createData.teamId,
    };

    // Add optional fields if defined
    if (createData.jerseyNumber !== undefined)
      cleanCreateData.jerseyNumber = createData.jerseyNumber;
    if (createData.currentTeam !== undefined) cleanCreateData.currentTeam = createData.currentTeam;
    if (createData.startDate !== undefined) cleanCreateData.startDate = createData.startDate;
    if (createData.endDate !== undefined) cleanCreateData.endDate = createData.endDate;
    if (createData.contractValue !== undefined)
      cleanCreateData.contractValue = createData.contractValue;
    if (createData.contractLength !== undefined)
      cleanCreateData.contractLength = createData.contractLength;

    const savedPlayerTeam = await prisma.playerTeam.create({
      data: cleanCreateData,
    });

    return PlayerTeam.fromPersistence(savedPlayerTeam);
  }

  async findById(id: number): Promise<PlayerTeam | null> {
    const playerTeam = await prisma.playerTeam.findUnique({
      where: { id },
      include: {
        Player: true, // ✅ Capitalized relationship name
        Team: true, // ✅ Capitalized relationship name
      },
    });

    return playerTeam ? PlayerTeam.fromPersistence(playerTeam) : null;
  }

  async findAll(
    filters?: PlayerTeamFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<PlayerTeam>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [playerTeams, total] = await Promise.all([
      prisma.playerTeam.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        include: {
          Player: true, // ✅ Capitalized relationship name
          Team: true, // ✅ Capitalized relationship name
        },
      }),
      prisma.playerTeam.count({ where }),
    ]);

    return {
      data: playerTeams.map((playerTeam) => PlayerTeam.fromPersistence(playerTeam)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, playerTeam: PlayerTeam): Promise<PlayerTeam> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('PlayerTeam', id);
    }

    const data = playerTeam.toPersistence();
    const { id: _, ...updateData } = data;

    // Use partial type for update since not all fields are required
    const cleanUpdateData: Partial<Prisma.PlayerTeamUncheckedUpdateInput> = {};

    // Only include defined values
    if (updateData.playerId !== undefined) cleanUpdateData.playerId = updateData.playerId;
    if (updateData.teamId !== undefined) cleanUpdateData.teamId = updateData.teamId;
    if (updateData.jerseyNumber !== undefined)
      cleanUpdateData.jerseyNumber = updateData.jerseyNumber;
    if (updateData.currentTeam !== undefined) cleanUpdateData.currentTeam = updateData.currentTeam;
    if (updateData.startDate !== undefined) cleanUpdateData.startDate = updateData.startDate;
    if (updateData.endDate !== undefined) cleanUpdateData.endDate = updateData.endDate;
    if (updateData.contractValue !== undefined)
      cleanUpdateData.contractValue = updateData.contractValue;
    if (updateData.contractLength !== undefined)
      cleanUpdateData.contractLength = updateData.contractLength;

    const updatedPlayerTeam = await prisma.playerTeam.update({
      where: { id },
      data: cleanUpdateData,
    });

    return PlayerTeam.fromPersistence(updatedPlayerTeam);
  }

  async delete(id: number): Promise<void> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('PlayerTeam', id);
    }

    await prisma.playerTeam.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.playerTeam.count({
      where: { id },
    });
    return count > 0;
  }

  // Domain-specific query methods
  async findByPlayerId(playerId: number): Promise<PlayerTeam[]> {
    const playerTeams = await prisma.playerTeam.findMany({
      where: { playerId },
      include: {
        Team: true, // ✅ Capitalized relationship name
      },
      orderBy: { startDate: 'desc' },
    });

    return playerTeams.map((playerTeam) => PlayerTeam.fromPersistence(playerTeam));
  }

  async findByTeamId(teamId: number): Promise<PlayerTeam[]> {
    const playerTeams = await prisma.playerTeam.findMany({
      where: { teamId },
      include: {
        Player: true, // ✅ Capitalized relationship name
      },
      orderBy: { jerseyNumber: 'asc' },
    });

    return playerTeams.map((playerTeam) => PlayerTeam.fromPersistence(playerTeam));
  }

  async findByPlayerAndTeam(playerId: number, teamId: number): Promise<PlayerTeam[]> {
    const playerTeams = await prisma.playerTeam.findMany({
      where: {
        playerId,
        teamId,
      },
      orderBy: { startDate: 'desc' },
    });

    return playerTeams.map((playerTeam) => PlayerTeam.fromPersistence(playerTeam));
  }

  async findCurrentTeamContracts(): Promise<PlayerTeam[]> {
    const playerTeams = await prisma.playerTeam.findMany({
      where: {
        currentTeam: true,
      },
      include: {
        Player: true, // ✅ Capitalized relationship name
        Team: true, // ✅ Capitalized relationship name
      },
      orderBy: { teamId: 'asc' },
    });

    return playerTeams.map((playerTeam) => PlayerTeam.fromPersistence(playerTeam));
  }

  async findCurrentTeamForPlayer(playerId: number): Promise<PlayerTeam | null> {
    const playerTeam = await prisma.playerTeam.findFirst({
      where: {
        playerId,
        currentTeam: true,
      },
      include: {
        Team: true, // ✅ Capitalized relationship name
      },
      orderBy: { startDate: 'desc' },
    });

    return playerTeam ? PlayerTeam.fromPersistence(playerTeam) : null;
  }

  async findPlayersForCurrentTeam(teamId: number): Promise<PlayerTeam[]> {
    const playerTeams = await prisma.playerTeam.findMany({
      where: {
        teamId,
        currentTeam: true,
      },
      include: {
        Player: true, // ✅ Capitalized relationship name
      },
      orderBy: { jerseyNumber: 'asc' },
    });

    return playerTeams.map((playerTeam) => PlayerTeam.fromPersistence(playerTeam));
  }

  async checkJerseyNumberAvailable(
    teamId: number,
    jerseyNumber: number,
    excludeId?: number
  ): Promise<boolean> {
    const where: any = {
      teamId,
      jerseyNumber,
      currentTeam: true,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.playerTeam.count({ where });
    return count === 0;
  }

  async findActiveByPlayerAndTeam(playerId: number, teamId: number): Promise<PlayerTeam | null> {
    const row = await prisma.playerTeam.findFirst({
      where: { playerId, teamId, currentTeam: true },
    });
    return row ? PlayerTeam.fromPersistence(row) : null;
  }

  async upsertCurrent(pt: PlayerTeam): Promise<PlayerTeam> {
  const existing = await prisma.playerTeam.findFirst({
    where: { playerId: pt.toPersistence().playerId, teamId: pt.toPersistence().teamId, currentTeam: true },
  })

  const data = {
    playerId: pt.toPersistence().playerId!,
    teamId: pt.toPersistence().teamId!,
    jerseyNumber: pt.toPersistence().jerseyNumber ?? null,
    currentTeam: true,
    startDate: pt.toPersistence().startDate ?? new Date(),
    endDate: pt.toPersistence().endDate ?? null,
    //position: pt.toPersistence().position ?? null,
  }

  if (existing) {
    const row = await prisma.playerTeam.update({ where: { id: existing.id }, data })
    return PlayerTeam.fromPersistence(row)
  }

  const row = await prisma.playerTeam.create({ data })
  return PlayerTeam.fromPersistence(row)
}

  private buildWhereClause(filters?: PlayerTeamFilters): object {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.playerId) {
      where.playerId = filters.playerId;
    }

    if (filters.teamId) {
      where.teamId = filters.teamId;
    }

    if (filters.jerseyNumber) {
      where.jerseyNumber = filters.jerseyNumber;
    }

    if (filters.currentTeam !== undefined) {
      where.currentTeam = filters.currentTeam;
    }

    if (filters.contractValue) {
      where.contractValue = { gte: filters.contractValue };
    }

    if (filters.contractLength) {
      where.contractLength = { gte: filters.contractLength };
    }

    return where;
  }
}
