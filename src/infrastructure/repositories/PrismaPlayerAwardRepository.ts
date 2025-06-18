// src/infrastructure/repositories/PrismaPlayerAwardRepository.ts

import { IPlayerAwardRepository, PlayerAwardFilters } from '@/domain/playerAward/repositories/IPlayerAwardRepository';
import { PlayerAward } from '@/domain/playerAward/entities/PlayerAward';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { NotFoundError } from '@/shared/errors/AppError';
import { prisma } from '../database/prisma';

export class PrismaPlayerAwardRepository implements IPlayerAwardRepository {
  async save(playerAward: PlayerAward): Promise<PlayerAward> {
    const data = playerAward.toPersistence();
    const { id, ...createData } = data;

    const savedPlayerAward = await prisma.playerAward.create({
      data: createData,
    });

    return PlayerAward.fromPersistence(savedPlayerAward);
  }

  async findById(id: number): Promise<PlayerAward | null> {
    const playerAward = await prisma.playerAward.findUnique({
      where: { id },
    });

    return playerAward ? PlayerAward.fromPersistence(playerAward) : null;
  }

  async findAll(
    filters?: PlayerAwardFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<PlayerAward>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [playerAwards, total] = await Promise.all([
      prisma.playerAward.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { yearAwarded: 'desc' },
          { awardName: 'asc' },
          { id: 'asc' }
        ],
      }),
      prisma.playerAward.count({ where }),
    ]);

    return {
      data: playerAwards.map((playerAward) => PlayerAward.fromPersistence(playerAward)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, playerAward: PlayerAward): Promise<PlayerAward> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('PlayerAward', id);
    }

    const data = playerAward.toPersistence();
    const { id: _, ...updateData } = data;

    const updatedPlayerAward = await prisma.playerAward.update({
      where: { id },
      data: updateData,
    });

    return PlayerAward.fromPersistence(updatedPlayerAward);
  }

  async delete(id: number): Promise<void> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('PlayerAward', id);
    }

    await prisma.playerAward.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.playerAward.count({
      where: { id },
    });
    return count > 0;
  }

  async findByPlayerId(playerId: number): Promise<PlayerAward[]> {
    const playerAwards = await prisma.playerAward.findMany({
      where: { playerId },
      orderBy: [
        { yearAwarded: 'desc' },
        { awardName: 'asc' }
      ],
    });

    return playerAwards.map((playerAward) => PlayerAward.fromPersistence(playerAward));
  }

  async findByAwardName(awardName: string): Promise<PlayerAward[]> {
    const playerAwards = await prisma.playerAward.findMany({
      where: {
        awardName: {
          contains: awardName,
        },
      },
      orderBy: [
        { yearAwarded: 'desc' },
        { awardName: 'asc' }
      ],
    });

    return playerAwards.map((playerAward) => PlayerAward.fromPersistence(playerAward));
  }

  async findByYear(year: number): Promise<PlayerAward[]> {
    const playerAwards = await prisma.playerAward.findMany({
      where: { yearAwarded: year },
      orderBy: [
        { awardName: 'asc' },
        { playerId: 'asc' }
      ],
    });

    return playerAwards.map((playerAward) => PlayerAward.fromPersistence(playerAward));
  }

  async countByPlayer(playerId: number): Promise<number> {
    return await prisma.playerAward.count({
      where: { playerId },
    });
  }

  private buildWhereClause(filters?: PlayerAwardFilters): object {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.playerId) {
      where.playerId = filters.playerId;
    }

    if (filters.awardName) {
      where.awardName = {
        contains: filters.awardName,
        mode: 'insensitive',
      };
    }

    if (filters.yearAwarded) {
      where.yearAwarded = filters.yearAwarded;
    }

    if (filters.yearFrom || filters.yearTo) {
      where.yearAwarded = {};
      if (filters.yearFrom) {
        (where.yearAwarded as any).gte = filters.yearFrom;
      }
      if (filters.yearTo) {
        (where.yearAwarded as any).lte = filters.yearTo;
      }
    }

    return where;
  }
}