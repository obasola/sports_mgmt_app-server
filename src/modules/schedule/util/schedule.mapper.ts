import { CreateScheduleDTO } from '../application/dtos/schedule.dto';
import { ScheduleProps } from '../domain/interface/schedule.props';

export function createSchedulePropsFromDTO(
  dto: Partial<CreateScheduleDTO>,
  defaultId = 0,
): ScheduleProps {
  return {
    id: defaultId,
    teamId: dto.teamId ?? 0,
    seasonYear: dto.seasonYear ?? '',
    oppTeamId: dto.oppTeamId ?? 0,
    oppTeamConference: dto.oppTeamConference ?? '',
    oppTeamDivision: dto.oppTeamDivision ?? '',
    scheduleWeek: dto.scheduleWeek ?? 0,
    gameDate: dto.gameDate ?? new Date(),
    gameCity: dto.gameCity ?? '',
    gameStateProvince: dto.gameStateProvince ?? '',
    gameCountry: dto.gameCountry ?? '',
    gameLocation: dto.gameLocation ?? '',
    wonLostFlag: dto.wonLostFlag ?? '',
    homeOrAway: dto.homeOrAway ?? '',
    oppTeamScore: dto.oppTeamScore ?? 0,
    teamScore: dto.teamScore ?? 0,
  };
}
