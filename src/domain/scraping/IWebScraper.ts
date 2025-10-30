// src/domain/scraping/IWebScraper.ts

export interface DraftPickData {
  round: number;
  pick: number;
  team: string;
  playerName: string;
  position: string;
  age: number | null;
  college: string;
  year: number;
}

export interface IWebScraper {
  scrapeDraftData(year: number): Promise<DraftPickData[]>;
}