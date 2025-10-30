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
  /**
   * Convert Prisma data (with null) to Domain entity format (with undefined)
   * This handles the mismatch between database null and TypeScript undefined
   */
  private convertToDomain(data: any): Parameters<typeof PlayerTeam.fromPersistence>[0] {
    return {
      ...data,
      isActive: data.isActive === 1, // Convert TinyInt to boolean
      startYear: data.startYear ?? undefined, // Convert null to undefined
      endYear: data.endYear ?? undefined, // Convert null to undefined
      jerseyNumber: data.jerseyNumber ?? undefined,
      contractValue: data.contractValue ?? undefined,
      contractLength: data.contractLength ?? undefined,
    };
  }

  /**
   * Convert domain entity to Prisma format
   */
  private convertToPrisma(data: any): any {
    return {
      ...data,
      isActive: data.isActive ? 1 : 0, // Convert boolean to TinyInt
      startYear: data.startYear ?? null, // Convert undefined to null
      endYear: data.endYear ?? null, // Convert undefined to null
      jerseyNumber: data.jerseyNumber ?? null,
      contractValue: data.contractValue ?? null,
      contractLength: data.contractLength ?? null,
    };
  }

  async save(playerTeam: PlayerTeam): Promise<PlayerTeam> {
    const data = playerTeam.toPersistence();
    const { id, ...createData } = data;

    // Build create data with required fields
    if (!createData.playerId || !createData.teamId) {
      throw new Error('playerId and teamId are required for creating PlayerTeam');
    }

    const cleanCreateData: Prisma.PlayerTeamUncheckedCreateInput = {
      playerId: createData.playerId,
      teamId: createData.teamId,
      jerseyNumber: createData.jerseyNumber ?? null,
      currentTeam: createData.currentTeam ?? false,
      startYear: createData.startYear ?? null,
      endYear: createData.endYear ?? null,
      contractValue: createData.contractValue ?? null,
      contractLength: createData.contractLength ?? null,
      isActive: createData.isActive ? 1 : 0,
    };

    const savedPlayerTeam = await prisma.playerTeam.create({
      data: cleanCreateData,
    });

    return PlayerTeam.fromPersistence(this.convertToDomain(savedPlayerTeam));
  }

  async findById(id: number): Promise<PlayerTeam | null> {
    const playerTeam = await prisma.playerTeam.findUnique({
      where: { id },
      include: {
        Player: true,
        Team: true,
      },
    });

    if (!playerTeam) return null;

    return PlayerTeam.fromPersistence(this.convertToDomain(playerTeam));
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
          Player: true,
          Team: true,
        },
      }),
      prisma.playerTeam.count({ where }),
    ]);

    return {
      data: playerTeams.map((playerTeam) =>
        PlayerTeam.fromPersistence(this.convertToDomain(playerTeam))
      ),
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

    const cleanUpdateData: Partial<Prisma.PlayerTeamUncheckedUpdateInput> = {};

    if (updateData.playerId !== undefined) cleanUpdateData.playerId = updateData.playerId;
    if (updateData.teamId !== undefined) cleanUpdateData.teamId = updateData.teamId;
    if (updateData.jerseyNumber !== undefined)
      cleanUpdateData.jerseyNumber = updateData.jerseyNumber ?? null;
    if (updateData.currentTeam !== undefined) cleanUpdateData.currentTeam = updateData.currentTeam;
    if (updateData.isActive !== undefined) cleanUpdateData.isActive = updateData.isActive ? 1 : 0;
    if (updateData.startYear !== undefined) cleanUpdateData.startYear = updateData.startYear ?? null;
    if (updateData.endYear !== undefined) cleanUpdateData.endYear = updateData.endYear ?? null;
    if (updateData.contractValue !== undefined)
      cleanUpdateData.contractValue = updateData.contractValue ?? null;
    if (updateData.contractLength !== undefined)
      cleanUpdateData.contractLength = updateData.contractLength ?? null;

    const updatedPlayerTeam = await prisma.playerTeam.update({
      where: { id },
      data: cleanUpdateData,
    });

    return PlayerTeam.fromPersistence(this.convertToDomain(updatedPlayerTeam));
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
        Team: true,
      },
      orderBy: { startYear: 'desc' },
    });

    return playerTeams.map((playerTeam) =>
      PlayerTeam.fromPersistence(this.convertToDomain(playerTeam))
    );
  }

  async findByTeamId(teamId: number): Promise<PlayerTeam[]> {
    const playerTeams = await prisma.playerTeam.findMany({
      where: { teamId },
      include: {
        Player: true,
      },
      orderBy: { jerseyNumber: 'asc' },
    });

    return playerTeams.map((playerTeam) =>
      PlayerTeam.fromPersistence(this.convertToDomain(playerTeam))
    );
  }

  async findByPlayerAndTeam(playerId: number, teamId: number): Promise<PlayerTeam[]> {
    const playerTeams = await prisma.playerTeam.findMany({
      where: {
        playerId,
        teamId,
      },
      orderBy: { startYear: 'desc' },
    });

    return playerTeams.map((playerTeam) =>
      PlayerTeam.fromPersistence(this.convertToDomain(playerTeam))
    );
  }

  async findCurrentTeamContracts(): Promise<PlayerTeam[]> {
    const playerTeams = await prisma.playerTeam.findMany({
      where: {
        currentTeam: true,
      },
      include: {
        Player: true,
        Team: true,
      },
      orderBy: { teamId: 'asc' },
    });

    return playerTeams.map((playerTeam) =>
      PlayerTeam.fromPersistence(this.convertToDomain(playerTeam))
    );
  }

  async findCurrentTeamForPlayer(playerId: number): Promise<PlayerTeam | null> {
    const playerTeam = await prisma.playerTeam.findFirst({
      where: {
        playerId,
        currentTeam: true,
      },
      include: {
        Team: true,
      },
      orderBy: { startYear: 'desc' },
    });

    if (!playerTeam) return null;

    return PlayerTeam.fromPersistence(this.convertToDomain(playerTeam));
  }

  async findPlayersForCurrentTeam(teamId: number): Promise<PlayerTeam[]> {
    const playerTeams = await prisma.playerTeam.findMany({
      where: {
        teamId,
        currentTeam: true,
      },
      include: {
        Player: true,
      },
      orderBy: { jerseyNumber: 'asc' },
    });

    return playerTeams.map((playerTeam) =>
      PlayerTeam.fromPersistence(this.convertToDomain(playerTeam))
    );
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

    if (!row) return null;

    return PlayerTeam.fromPersistence(this.convertToDomain(row));
  }

  async upsertCurrent(pt: PlayerTeam): Promise<PlayerTeam> {
    const existing = await prisma.playerTeam.findFirst({
      where: {
        playerId: pt.toPersistence().playerId,
        teamId: pt.toPersistence().teamId,
        currentTeam: true,
      },
    });

    const persistence = pt.toPersistence();

    // Convert startYear - handle number, Date, or undefined
    let startYearValue: number | null = null;
    if (persistence.startYear !== undefined) {
      // startYear is already a number or undefined from the entity
      startYearValue = persistence.startYear ?? null;
    }

    const data: Prisma.PlayerTeamUncheckedCreateInput = {
      playerId: persistence.playerId!,
      teamId: persistence.teamId!,
      jerseyNumber: persistence.jerseyNumber ?? null,
      currentTeam: true,
      startYear: startYearValue,
      endYear: persistence.endYear ?? null,
      isActive: persistence.isActive ? 1 : 0,
    };

    if (existing) {
      const row = await prisma.playerTeam.update({
        where: { id: existing.id },
        data: data as Prisma.PlayerTeamUncheckedUpdateInput,
      });
      return PlayerTeam.fromPersistence(this.convertToDomain(row));
    }

    const row = await prisma.playerTeam.create({ data });
    return PlayerTeam.fromPersistence(this.convertToDomain(row));
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