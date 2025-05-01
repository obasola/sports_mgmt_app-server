/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
// src/modules/schedule/domain/schedule.entity.ts

import { BaseEntity } from '../../../shared/domain/BaseEntity';
import { ScheduleProps } from './interface/schedule.props';

export class Schedule extends BaseEntity<ScheduleProps> {
  private constructor(props: ScheduleProps) {
    super(props);
  }

  // Getters
  get teamId(): number {
    return this.props.teamId;
  }

  get seasonYear(): string {
    return this.props.seasonYear;
  }

  get oppTeamId(): number {
    return this.props.oppTeamId;
  }

  get oppTeamConference(): string {
    return this.props.oppTeamConference;
  }

  get oppTeamDivision(): string {
    return this.props.oppTeamDivision;
  }

  get scheduleWeek(): number {
    return this.props.scheduleWeek;
  }

  get gameDate(): Date {
    return this.props.gameDate;
  }

  get gameCity(): string {
    return this.props.gameCity;
  }

  get gameStateProvince(): string {
    return this.props.gameStateProvince;
  }

  get gameCountry(): string {
    return this.props.gameCountry;
  }

  get gameLocation(): string {
    return this.props.gameLocation;
  }

  get wonLostFlag(): string {
    return this.props.wonLostFlag;
  }

  get homeOrAway(): string {
    return this.props.homeOrAway;
  }

  get oppTeamScore(): number {
    return this.props.oppTeamScore;
  }

  get teamScore(): number {
    return this.props.teamScore;
  }

  // Setters
  set teamId(teamId: number) {
    this.props.teamId = teamId;
  }

  set seasonYear(seasonYear: string) {
    this.props.seasonYear = seasonYear;
  }

  set oppTeamId(oppTeamId: number) {
    this.props.oppTeamId = oppTeamId;
  }

  set oppTeamConference(oppTeamConference: string) {
    this.props.oppTeamConference = oppTeamConference;
  }

  set oppTeamDivision(oppTeamDivision: string) {
    this.props.oppTeamDivision = oppTeamDivision;
  }

  set scheduleWeek(scheduleWeek: number) {
    this.props.scheduleWeek = scheduleWeek;
  }

  set gameDate(gameDate: Date) {
    this.props.gameDate = gameDate;
  }

  set gameCity(gameCity: string) {
    this.props.gameCity = gameCity;
  }

  set gameStateProvince(gameStateProvince: string) {
    this.props.gameStateProvince = gameStateProvince;
  }

  set gameCountry(gameCountry: string) {
    this.props.gameCountry = gameCountry;
  }

  set gameLocation(gameLocation: string) {
    this.props.gameLocation = gameLocation;
  }

  set wonLostFlag(wonLostFlag: string) {
    this.props.wonLostFlag = wonLostFlag;
  }

  set homeOrAway(homeOrAway: string) {
    this.props.homeOrAway = homeOrAway;
  }

  set oppTeamScore(oppTeamScore: number) {
    this.props.oppTeamScore = oppTeamScore;
  }

  set teamScore(teamScore: number) {
    this.props.teamScore = teamScore;
  }

  // Static factory method
  static create(props: ScheduleProps): Schedule {
    return new Schedule(props);
  }

  // Convert to plain object for persistence
  toObject() {
    return {
      ...this.props,
    };
  }

  // String representation of the entity
  toString(): string {
    const date = this.props.gameDate ? this.props.gameDate.toLocaleDateString() : 'TBD';

    const homeTeam =
      this.props.homeOrAway === 'H' ? `Team ${this.props.teamId}` : `Team ${this.props.oppTeamId}`;

    const awayTeam =
      this.props.homeOrAway === 'A' ? `Team ${this.props.teamId}` : `Team ${this.props.oppTeamId}`;

    const score =
      this.props.teamScore !== null && this.props.oppTeamScore !== null
        ? `${this.props.teamScore} - ${this.props.oppTeamScore}`
        : 'Not played';

    const location = this.props.gameLocation ? this.props.gameLocation : 'Location TBD';

    return `[Week ${
      this.props.scheduleWeek || 'TBD'
    }] ${date}: ${awayTeam} @ ${homeTeam}, ${location}, Score: ${score}`;
  }
}
