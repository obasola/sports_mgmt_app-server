import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { IDraftPickScraper } from '../../domain/draftpick/interfaces/IDraftPickScraper';
import { DraftPickDTO, DraftPickScraperResult } from '../../domain/draftpick/dto/DraftPickDTO';
import { IScraperConfig } from './IScraperConfig';

/**
 * Pro Football Reference Draft Pick Scraper
 * Implements web scraping for NFL draft picks
 * Follows Single Responsibility Principle - only handles scraping logic
 */
export class ProFootballReferenceScraper implements IDraftPickScraper {
  private readonly axiosInstance: AxiosInstance;
  private readonly config: IScraperConfig;

  constructor(config: IScraperConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      timeout: config.timeout,
      headers: {
        'User-Agent': config.userAgent,
      },
    });
  }

  /**
   * Scrapes draft picks for a specific year from Pro Football Reference
   */
  async scrapeDraftYear(year: number): Promise<DraftPickScraperResult> {
    const url = `${this.config.baseUrl}/years/${year}/draft.htm`;
    let attempt = 0;

    while (attempt < this.config.retryAttempts) {
      try {
        const html = await this.fetchHtml(url);
        const picks = this.parseDraftTable(html);

        return {
          year,
          picks,
          totalPicks: picks.length,
          scrapedAt: new Date(),
        };
      } catch (error) {
        attempt++;
        if (attempt >= this.config.retryAttempts) {
          throw new Error(
            `Failed to scrape draft year ${year} after ${this.config.retryAttempts} attempts: ${error}`
          );
        }
        await this.delay(this.config.retryDelay);
      }
    }

    throw new Error(`Failed to scrape draft year ${year}`);
  }

  /**
   * Validates if a URL is accessible and scrapable
   */
  async validateUrl(url: string): Promise<boolean> {
    try {
      const response = await this.axiosInstance.head(url);
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Fetches HTML content from a URL
   */
  private async fetchHtml(url: string): Promise<string> {
    const response = await this.axiosInstance.get(url);
    return response.data;
  }

  /**
   * Parses the draft table from HTML content
   */
  private parseDraftTable(html: string): DraftPickDTO[] {
    const $ = cheerio.load(html);
    const picks: DraftPickDTO[] = [];

    // Target the draft picks table
    $('#drafts tbody tr').each((_, element) => {
      const row = $(element);

      // Skip header rows
      if (row.hasClass('thead')) {
        return;
      }

      try {
        const pick = this.parseTableRow(row, $);
        if (pick) {
          picks.push(pick);
        }
      } catch (error) {
        console.warn(`Failed to parse draft pick row: ${error}`);
      }
    });

    return picks;
  }

  /**
   * Parses a single table row into a DraftPickDTO
   */
  private parseTableRow(row: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): DraftPickDTO | null {
    const round = this.extractNumber(row.find('[data-stat="draft_round"]').text());
    const pickNumber = this.extractNumber(row.find('[data-stat="draft_pick"]').text());
    const teamAbbreviation = row.find('[data-stat="team"]').text().trim();
    const playerName = row.find('[data-stat="player"]').text().trim();
    const position = row.find('[data-stat="pos"]').text().trim();
    const age = this.extractNumber(row.find('[data-stat="age"]').text());
    const college = row.find('[data-stat="college_name"]').text().trim();

    // Validate required fields
    if (!round || !pickNumber || !playerName) {
      return null;
    }

    return {
      round,
      pickNumber,
      teamAbbreviation,
      playerName,
      position,
      age: age || 0,
      college: college || 'Unknown',
    };
  }

  /**
   * Extracts a number from a string
   */
  private extractNumber(text: string): number {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * Delays execution for a specified duration
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}