import { IPlayerAwardRepository } from '../domain/iplayer-award.repository';
import { PlayerAward } from '../domain/player-award.entity';
import { CreatePlayerAwardDTO, PlayerAwardDTO } from './dtos/player-award.dto';

export class PlayerAwardService {
  constructor(private repo: IPlayerAwardRepository) {}

  async getAll(): Promise<PlayerAward[]> {
    return this.repo.findAll();
  }

  async getById(id: number): Promise<PlayerAward | null> {
    return this.repo.findById(id);
  }

  async getPlayerAwardsByPlayerId(playerId: number): Promise<PlayerAwardDTO[]> {
    const playerAwards = await this.repo.findByPlayerId(playerId);
    return playerAwards.map(award => award.toObject() as PlayerAwardDTO);
  }

  async getPlayerAwardsByAwardName(awardName: string): Promise<PlayerAwardDTO[]> {
    const playerAwards = await this.repo.findByAwardName(awardName);
    return playerAwards.map(award => award.toObject() as PlayerAwardDTO);
  }

  async getPlayerAwardsByYear(year: number): Promise<PlayerAwardDTO[]> {
    const playerAwards = await this.repo.findByYear(year);
    return playerAwards.map(award => award.toObject() as PlayerAwardDTO);
  }

  async create(dto: CreatePlayerAwardDTO): Promise<PlayerAward> {
    const entity = new PlayerAward(0, dto.playerId, dto.awardName ?? null, dto.yearAwarded ?? null);
    return this.repo.create(entity);
  }

  async update(id: number, dto: Partial<PlayerAwardDTO>): Promise<PlayerAward> {
    return this.repo.update(id, dto);
  }

  async delete(id: number): Promise<void> {
    return this.repo.delete(id);
  }
}
