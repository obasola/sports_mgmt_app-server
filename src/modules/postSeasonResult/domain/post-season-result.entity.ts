/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
// src/modules/postSeasonResult/domain/postSeasonResult.entity.ts

import { BaseEntity } from '../../../shared/domain/BaseEntity';

interface PostSeasonResultProps {
  id: number;
  playoffYear: number;
  lastRoundReached?: string;
  winLose?: string;
  opponentScore?: number;
  teamScore?: number;
  teamId?: number;
}

export class PostSeasonResult extends BaseEntity<PostSeasonResultProps> {
  constructor(props: PostSeasonResultProps) {
    super(props);
  }

  // Getters
  get Id(): number {
    return this.props.id === null ? 0 : this.props.id;
  }

  get playoffYear(): number {
    return this.props.playoffYear === null ? 0 : this.props.playoffYear;
  }

  get lastRoundReached(): string | null {
    return this.props.lastRoundReached === undefined ? null : this.props.lastRoundReached;
  }

  get winLose(): string | null {
    return this.props.winLose === undefined ? null : this.props.winLose;
  }

  get opponentScore(): number | null {
    return this.props.opponentScore === undefined ? 0 : this.props.opponentScore;
  }

  get teamScore(): number | null {
    return this.props.teamScore === undefined ? 0 : this.props.teamScore;
  }

  get teamId(): number | null {
    return this.props.teamId === undefined ? 0 : this.props.teamId;
  }

  // Setters
  set id(id: number) {
    this.props.id = id;
  }

  set playoffYear(playoffYear: number) {
    this.props.playoffYear = playoffYear;
  }

  set lastRoundReached(lastRoundReached: string | null) {
    this.props.lastRoundReached = lastRoundReached === undefined ? '' : this.props.lastRoundReached;
  }

  set winLose(winLose: string | null) {
    this.props.winLose = winLose === undefined ? '' : this.props.winLose;
  }

  set opponentScore(opponentScore: number | null) {
    this.props.opponentScore = opponentScore === undefined ? 0 : this.props.opponentScore;
  }

  set teamScore(teamScore: number | null) {
    this.props.teamScore = teamScore === undefined ? 0 : this.props.teamScore;
  }

  set teamId(teamId: number | null) {
    this.props.teamId = teamId === undefined ? 0 : this.props.teamId;
  }

  // Static create method
  static create(props: PostSeasonResultProps): PostSeasonResult {
    return new PostSeasonResult(props);
  }

  // Convert to plain object for persistence
  toObject() {
    return {
      playoffYear: this.props.playoffYear,
      lastRoundReached: this.props.lastRoundReached,
      winLose: this.props.winLose,
      opponentScore: this.props.opponentScore,
      teamScore: this.props.teamScore,
      teamId: this.props.teamId,
    };
  }
}
