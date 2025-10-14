import { TeamStanding } from '@/domain/standings/entities/TeamStanding';
import { TeamStandingDto } from '../dto/TeamStandingDto';

export class StandingsMapper {
  static toDto(entity: TeamStanding): TeamStandingDto {
    return {
      teamId: entity.teamId,
      teamName: entity.teamName,            // ✅ must be included
      division: entity.division,
      conference: entity.conference,
      wins: entity.wins,
      losses: entity.losses,
      ties: entity.ties,
      winPct: entity.winPct,                // ✅ computed getter
      pointsFor: entity.pointsFor ?? 0,
      pointsAgainst: entity.pointsAgainst ?? 0,
      pointDiff: entity.pointDiff,          // ✅ computed getter
      streak: entity.streak ?? '',
      divisionWins: entity.divisionWins ?? 0,
      divisionLosses: entity.divisionLosses ?? 0,
      conferenceWins: entity.conferenceWins ?? 0,
      conferenceLosses: entity.conferenceLosses ?? 0,
    };
  }

  static toDtoList(entities: TeamStanding[]): TeamStandingDto[] {
    return entities.map((e) => this.toDto(e));
  }
}
