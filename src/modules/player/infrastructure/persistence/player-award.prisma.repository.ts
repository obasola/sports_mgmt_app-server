// src/modules/player/infrastructure/persistence/PlayerAwardPrismaRepository.ts

import { PrismaClient } from '@prisma/client';
import { IPlayerAwardRepository } from '../../domain/iplayer-award.repository';
import { PlayerAward } from '../../domain/player-award.entity';

const prisma = new PrismaClient();

export class PlayerAwardPrismaRepository implements IPlayerAwardRepository {
  async findAll(): Promise<PlayerAward[]> {
    const awards = await prisma.playerAward.findMany();
    return awards.map(a => new PlayerAward(a.id, a.playerId, a.awardName, a.yearAwarded));
  }

  async findById(id: number): Promise<PlayerAward | null> {
    const a = await prisma.playerAward.findUnique({ where: { id } });
    return a ? new PlayerAward(a.id, a.playerId, a.awardName, a.yearAwarded) : null;
  }

  async findByPlayerId(playerId: number): Promise<PlayerAward[]> {
    const playerAwards = await prisma.playerAward.findMany({
      where: { playerId },
    });
    return playerAwards.map(
      award => new PlayerAward(award.id, award.playerId, award.awardName, award.yearAwarded),
    );
  }

  async findByAwardName(awardName: string): Promise<PlayerAward[]> {
    const playerAwards = await prisma.playerAward.findMany({
      where: { awardName },
    });
    return playerAwards.map(
      award => new PlayerAward(award.id, award.playerId, award.awardName, award.yearAwarded),
    );
  }

  async findByYear(year: number): Promise<PlayerAward[]> {
    const playerAwards = await prisma.playerAward.findMany({
      where: { yearAwarded: year },
    });
    return playerAwards.map(
      award => new PlayerAward(award.id, award.playerId, award.awardName, award.yearAwarded),
    );
  }

  async create(data: PlayerAward): Promise<PlayerAward> {
    const a = await prisma.playerAward.create({ data });
    return new PlayerAward(a.id, a.playerId, a.awardName, a.yearAwarded);
  }

  async update(id: number, data: Partial<PlayerAward>): Promise<PlayerAward> {
    const a = await prisma.playerAward.update({ where: { id }, data });
    return new PlayerAward(a.id, a.playerId, a.awardName, a.yearAwarded);
  }

  async delete(id: number): Promise<void> {
    await prisma.playerAward.delete({ where: { id } });
  }
}

// src/modules/playerAward/dto/PlayerAwardDTO.ts
export interface PlayerAwardDTO {
  id?: number;
  playerId: number;
  awardName?: string;
  yearAwarded?: number;
}
