// src/domain/playoffs/valueObjects/PlayoffBracket.ts

import { PlayoffConference, PlayoffMatchup } from "./PlayoffTypes";

export interface PlayoffRoundGroup {
  round: 'WILDCARD' | 'DIVISIONAL' | 'CONFERENCE';
  conference: PlayoffConference;
  matchups: PlayoffMatchup[];
}

export interface SuperBowlMatchup extends PlayoffMatchup {
  conference: 'AFC' | 'NFC'; // still track which side each team came from
}

export interface PlayoffBracket {
  seasonYear: number;
  afcRounds: PlayoffRoundGroup[];
  nfcRounds: PlayoffRoundGroup[];
  superBowl: SuperBowlMatchup | null;
}

