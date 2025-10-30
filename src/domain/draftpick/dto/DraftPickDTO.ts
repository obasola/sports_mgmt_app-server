// src/server/domain/draftpick/dto/DraftPickDTO.ts
/**
 * Draft Pick Data Transfer Object
 * Represents scraped draft pick data
 */
export interface DraftPickDTO {
  round: number;
  pickNumber: number;
  teamAbbreviation: string;
  playerName: string;
  position: string;
  age: number;
  college: string;
}

/**
 * Draft Pick Scraper Result
 * Represents the result of a scraping operation
 */
export interface DraftPickScraperResult {
  year: number;
  picks: DraftPickDTO[];
  totalPicks: number;
  scrapedAt: Date;
}