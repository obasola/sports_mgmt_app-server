// src/infrastructure/repositories/PrismaDraftPickRepository.ts
import { IDraftPickRepository, DraftPickFilters } from '@/domain/draftpick/repositories/IDraftPickRepository';
import { DraftPick } from '@/domain/draftpick/entities/DraftPick';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { NotFoundError } from '@/shared/errors/AppError';
import { prisma } from '../database/prisma';

export class PrismaDraftPickRepository implements IDraftPickRepository {
  async save(draftPick: DraftPick): Promise<DraftPick> {
    const data = draftPick.toPersistence();
    const { id, ...createData } = data;

    const savedDraftPick = await prisma.draftPick.create({
      data: createData,
    });

    return DraftPick.fromPersistence(savedDraftPick);
  }

  async findById(id: number): Promise<DraftPick | null> {
    const draftPick = await prisma.draftPick.findUnique({
      where: { id },
    });

    return draftPick ? DraftPick.fromPersistence(draftPick) : null;
  }

  async findAll(
    filters?: DraftPickFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<DraftPick>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [draftPicks, total] = await Promise.all([
      prisma.draftPick.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { draftYear: 'desc' },
          { round: 'asc' },
          { pickNumber: 'asc' },
        ],
      }),
      prisma.draftPick.count({ where }),
    ]);

    return {
      data: draftPicks.map((draftPick) => DraftPick.fromPersistence(draftPick)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, draftPick: DraftPick): Promise<DraftPick> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('DraftPick', id);
    }

    const data = draftPick.toPersistence();
    const { id: _, ...updateData } = data;

    const updatedDraftPick = await prisma.draftPick.update({
      where: { id },
      data: updateData,
    });

    return DraftPick.fromPersistence(updatedDraftPick);
  }

  async delete(id: number): Promise<void> {
    const exists = await this.exists(id);
    if (!exists) {
      throw new NotFoundError('DraftPick', id);
    }

    await prisma.draftPick.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.draftPick.count({
      where: { id },
    });
    return count > 0;
  }

  async findByTeam(teamId: number, draftYear?: number): Promise<DraftPick[]> {
    const where: any = { currentTeamId: teamId };
    if (draftYear) {
      where.draftYear = draftYear;
    }

    const draftPicks = await prisma.draftPick.findMany({
      where,
      orderBy: [
        { draftYear: 'desc' },
        { round: 'asc' },
        { pickNumber: 'asc' },
      ],
    });

    return draftPicks.map((draftPick) => DraftPick.fromPersistence(draftPick));
  }

  async findByRound(round: number, draftYear: number): Promise<DraftPick[]> {
    const draftPicks = await prisma.draftPick.findMany({
      where: {
        round,
        draftYear,
      },
      orderBy: { pickNumber: 'asc' },
    });

    return draftPicks.map((draftPick) => DraftPick.fromPersistence(draftPick));
  }

  async findByDraftYear(draftYear: number): Promise<DraftPick[]> {
    const draftPicks = await prisma.draftPick.findMany({
      where: { draftYear },
      orderBy: [
        { round: 'asc' },
        { pickNumber: 'asc' },
      ],
    });

    return draftPicks.map((draftPick) => DraftPick.fromPersistence(draftPick));
  }

  async findUnusedPicks(teamId?: number, draftYear?: number): Promise<DraftPick[]> {
    const where: any = { used: false };
    if (teamId) {
      where.currentTeamId = teamId;
    }
    if (draftYear) {
      where.draftYear = draftYear;
    }

    const draftPicks = await prisma.draftPick.findMany({
      where,
      orderBy: [
        { draftYear: 'desc' },
        { round: 'asc' },
        { pickNumber: 'asc' },
      ],
    });

    return draftPicks.map((draftPick) => DraftPick.fromPersistence(draftPick));
  }

  async findUsedPicks(teamId?: number, draftYear?: number): Promise<DraftPick[]> {
    const where: any = { used: true };
    if (teamId) {
      where.currentTeamId = teamId;
    }
    if (draftYear) {
      where.draftYear = draftYear;
    }

    const draftPicks = await prisma.draftPick.findMany({
      where,
      orderBy: [
        { draftYear: 'desc' },
        { round: 'asc' },
        { pickNumber: 'asc' },
      ],
    });

    return draftPicks.map((draftPick) => DraftPick.fromPersistence(draftPick));
  }

  async findTradedPicks(draftYear?: number): Promise<DraftPick[]> {
    const where: any = {
      NOT: {
        originalTeam: null,
      },
    };
    if (draftYear) {
      where.draftYear = draftYear;
    }

    const draftPicks = await prisma.draftPick.findMany({
      where,
      orderBy: [
        { draftYear: 'desc' },
        { round: 'asc' },
        { pickNumber: 'asc' },
      ],
    });

    return draftPicks.map((draftPick) => DraftPick.fromPersistence(draftPick));
  }

  async findByPickNumber(pickNumber: number, draftYear: number): Promise<DraftPick | null> {
    const draftPick = await prisma.draftPick.findFirst({
      where: {
        pickNumber,
        draftYear,
      },
    });

    return draftPick ? DraftPick.fromPersistence(draftPick) : null;
  }

  async findByRoundAndPickInRound(round: number, pickInRound: number, draftYear: number): Promise<DraftPick | null> {
    // Calculate overall pick number from round and pick in round
    const pickNumber = (round - 1) * 32 + pickInRound;
    return this.findByPickNumber(pickNumber, draftYear);
  }

  async findFirstRoundPicks(draftYear: number): Promise<DraftPick[]> {
    return this.findByRound(1, draftYear);
  }

  async findCompensatoryPicks(draftYear: number): Promise<DraftPick[]> {
    const draftPicks = await prisma.draftPick.findMany({
      where: {
        draftYear,
        pickNumber: { gt: 224 }, // Picks after 7 * 32 regular picks
      },
      orderBy: { pickNumber: 'asc' },
    });

    return draftPicks.map((draftPick) => DraftPick.fromPersistence(draftPick));
  }

  async findByProspect(prospectId: number): Promise<DraftPick | null> {
    const draftPick = await prisma.draftPick.findFirst({
      where: { prospectId },
    });

    return draftPick ? DraftPick.fromPersistence(draftPick) : null;
  }

  async findByPlayer(playerId: number): Promise<DraftPick | null> {
    const draftPick = await prisma.draftPick.findFirst({
      where: { playerId },
    });

    return draftPick ? DraftPick.fromPersistence(draftPick) : null;
  }

  async isPickNumberTaken(pickNumber: number, draftYear: number): Promise<boolean> {
    const count = await prisma.draftPick.count({
      where: {
        pickNumber,
        draftYear,
      },
    });
    return count > 0;
  }

  async getTeamPickCount(teamId: number, draftYear: number): Promise<number> {
    return prisma.draftPick.count({
      where: {
        currentTeamId: teamId,
        draftYear,
      },
    });
  }

  async getNextAvailablePickNumber(round: number, draftYear: number): Promise<number> {
    const startPickNumber = (round - 1) * 32 + 1;
    const endPickNumber = round * 32;

    const existingPicks = await prisma.draftPick.findMany({
      where: {
        draftYear,
        pickNumber: {
          gte: startPickNumber,
          lte: endPickNumber,
        },
      },
      select: { pickNumber: true },
      orderBy: { pickNumber: 'asc' },
    });

    const existingPickNumbers = new Set(existingPicks.map(p => p.pickNumber));

    for (let pickNumber = startPickNumber; pickNumber <= endPickNumber; pickNumber++) {
      if (!existingPickNumbers.has(pickNumber)) {
        return pickNumber;
      }
    }

    // If all regular picks are taken, return the next compensatory pick number
    return endPickNumber + 1;
  }

  private buildWhereClause(filters?: DraftPickFilters): object {
    if (!filters) return {};

    const where: Record<string, unknown> = {};

    if (filters.round !== undefined) {
      where.round = filters.round;
    }

    if (filters.draftYear !== undefined) {
      where.draftYear = filters.draftYear;
    }

    if (filters.currentTeamId !== undefined) {
      where.currentTeamId = filters.currentTeamId;
    }

    if (filters.originalTeam !== undefined) {
      where.originalTeam = filters.originalTeam;
    }

    if (filters.used !== undefined) {
      where.used = filters.used;
    }

    if (filters.prospectId !== undefined) {
      where.prospectId = filters.prospectId;
    }

    if (filters.playerId !== undefined) {
      where.playerId = filters.playerId;
    }

    if (filters.minPickNumber !== undefined || filters.maxPickNumber !== undefined) {
      where.pickNumber = {};
      if (filters.minPickNumber !== undefined) {
        (where.pickNumber as any).gte = filters.minPickNumber;
      }
      if (filters.maxPickNumber !== undefined) {
        (where.pickNumber as any).lte = filters.maxPickNumber;
      }
    }

    if (filters.isFirstRound) {
      where.round = 1;
    }

    if (filters.hasProspect !== undefined) {
      if (filters.hasProspect) {
        where.prospectId = { not: null };
      } else {
        where.prospectId = null;
      }
    }

    if (filters.hasPlayer !== undefined) {
      if (filters.hasPlayer) {
        where.playerId = { not: null };
      } else {
        where.playerId = null;
      }
    }

    return where;
  }
}