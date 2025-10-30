// src/infrastructure/scraping/ProFootballReferenceScraper.ts

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Logger } from '../../lib/Logger';

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

export class ProFootballReferenceScraper implements IWebScraper {
  private readonly baseUrl = 'https://www.pro-football-reference.com';
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async scrapeDraftData(year: number): Promise<DraftPickData[]> {
    const url = `${this.baseUrl}/years/${year}/draft.htm`;
    this.logger.info(`Scraping draft data from: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 30000
      });

      return this.parseDraftTable(response.data, year);
    } catch (error) {
      this.logger.error('Failed to scrape draft data', { error, year });
      throw new Error(`Failed to scrape draft data for year ${year}: ${error}`);
    }
  }

  private parseDraftTable(html: string, year: number): DraftPickData[] {
    const $ = cheerio.load(html);
    const draftPicks: DraftPickData[] = [];

    $('#drafts tbody tr').each((_, row) => {
      const $row = $(row);
      
      // Skip header rows and empty rows
      if ($row.hasClass('thead') || !$row.find('td').length) {
        return;
      }

      const round = this.parseNumber($row.find('th[data-stat="draft_round"]').text());
      const pick = this.parseNumber($row.find('td[data-stat="draft_pick"]').text());
      const team = $row.find('td[data-stat="team"]').text().trim();
      const playerName = $row.find('td[data-stat="player"] a').text().trim() || 
                        $row.find('td[data-stat="player"]').text().trim();
      const position = $row.find('td[data-stat="pos"]').text().trim();
      const age = this.parseNumber($row.find('td[data-stat="age"]').text());
      const college = $row.find('td[data-stat="college"]').text().trim();

      if (round && pick && playerName) {
        draftPicks.push({
          round,
          pick,
          team,
          playerName,
          position,
          age,
          college,
          year
        });
      }
    });

    this.logger.info(`Parsed ${draftPicks.length} draft picks for year ${year}`);
    return draftPicks;
  }

  private parseNumber(text: string): number | null {
    const num = parseInt(text.trim(), 10);
    return isNaN(num) ? null : num;
  }
}