// src/modules/schedule/application/dtos/schedule.dto.ts
export interface ScheduleDTO {
  id: number;
  teamId: number;
  seasonYear: string;
  oppTeamId: number;
  oppTeamConference: string;
  oppTeamDivision: string;
  scheduleWeek: number;
  gameDate: Date;
  gameCity: string;
  gameStateProvince: string;
  gameCountry: string;
  gameLocation: string;
  wonLostFlag: string;
  homeOrAway: string;
  oppTeamScore: number;
  teamScore: number;
}

export interface CreateScheduleDTO {
  teamId: number;
  seasonYear: string;
  oppTeamId: number;
  oppTeamConference?: string;
  oppTeamDivision?: string;
  scheduleWeek?: number;
  gameDate?: Date;
  gameCity?: string;
  gameStateProvince?: string;
  gameCountry?: string;
  gameLocation?: string;
  wonLostFlag?: string;
  homeOrAway?: string;
  oppTeamScore?: number;
  teamScore?: number;
}

export interface UpdateScheduleDTO {
  teamId?: number;
  seasonYear?: string;
  oppTeamId?: number;
  oppTeamConference?: string;
  oppTeamDivision?: string;
  scheduleWeek?: number;
  gameDate?: Date;
  gameCity?: string;
  gameStateProvince?: string;
  gameCountry?: string;
  gameLocation?: string;
  wonLostFlag?: string;
  homeOrAway?: string;
  oppTeamScore?: number;
  teamScore?: number;
}
