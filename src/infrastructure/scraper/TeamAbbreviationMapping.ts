/**
 * Team Abbreviation Mapper
 * Maps Pro Football Reference abbreviations to your database abbreviations
 * Following Single Responsibility Principle
 */

export interface TeamAbbreviationMapping {
  [key: string]: string;
}

/**
 * Mapping from Pro Football Reference abbreviations to standard NFL abbreviations
 * Pro-Football-Reference uses slightly different abbreviations than ESPN/official NFL
 */
export const PFR_TO_STANDARD_MAPPING: TeamAbbreviationMapping = {
  // Teams with different abbreviations on PFR
  'NWE': 'NE',   // New England Patriots
  'LVR': 'LV',   // Las Vegas Raiders
  'NOR': 'NO',   // New Orleans Saints
  'GNB': 'GB',   // Green Bay Packers
  'SFO': 'SF',   // San Francisco 49ers
  'KAN': 'KC',   // Kansas City Chiefs
  'TAM': 'TB',   // Tampa Bay Buccaneers
  'RAV': 'BAL',  // Baltimore Ravens (rare usage)
  'CLT': 'IND',  // Indianapolis Colts (rare usage)
  'OTI': 'TEN',  // Tennessee Titans (rare usage)
  'RAM': 'LAR',  // Los Angeles Rams
  'RAI': 'LV',   // Oakland/Las Vegas Raiders (old)
  'SDG': 'LAC',  // San Diego Chargers -> Los Angeles Chargers
  'STL': 'LAR',  // St. Louis Rams -> Los Angeles Rams
  
  // Teams that are the same (for completeness)
  'ARI': 'ARI', // Arizona Cardinals
  'ATL': 'ATL', // Atlanta Falcons
  'BAL': 'BAL', // Baltimore Ravens
  'BUF': 'BUF', // Buffalo Bills
  'CAR': 'CAR', // Carolina Panthers
  'CHI': 'CHI', // Chicago Bears
  'CIN': 'CIN', // Cincinnati Bengals
  'CLE': 'CLE', // Cleveland Browns
  'DAL': 'DAL', // Dallas Cowboys
  'DEN': 'DEN', // Denver Broncos
  'DET': 'DET', // Detroit Lions
  'GB':  'GB',  // Green Bay Packers
  'HOU': 'HOU', // Houston Texans
  'IND': 'IND', // Indianapolis Colts
  'JAX': 'JAX', // Jacksonville Jaguars
  'KC':  'KC',  // Kansas City Chiefs
  'LAC': 'LAC', // Los Angeles Chargers
  'LAR': 'LAR', // Los Angeles Rams
  'LV':  'LV',  // Las Vegas Raiders
  'OAK':  'LV',  // Las Vegas Raiders
  'MIA': 'MIA', // Miami Dolphins
  'MIN': 'MIN', // Minnesota Vikings
  'NE':  'NE',  // New England Patriots
  'NO':  'NO',  // New Orleans Saints
  'NYG': 'NYG', // New York Giants
  'NYJ': 'NYJ', // New York Jets
  'PHI': 'PHI', // Philadelphia Eagles
  'PIT': 'PIT', // Pittsburgh Steelers
  'SEA': 'SEA', // Seattle Seahawks
  'SF':  'SF',  // San Francisco 49ers
  'TB':  'TB',  // Tampa Bay Buccaneers
  'TEN': 'TEN', // Tennessee Titans
  'WAS': 'WAS', // Washington Commanders
};

/**
 * Team Abbreviation Mapper Service
 * Converts Pro Football Reference abbreviations to standard abbreviations
 */
export class TeamAbbreviationMapper {
  private readonly mapping: TeamAbbreviationMapping;

  constructor(customMapping?: TeamAbbreviationMapping) {
    this.mapping = customMapping || PFR_TO_STANDARD_MAPPING;
  }

  /**
   * Maps a Pro Football Reference abbreviation to standard abbreviation
   * @param pfrAbbreviation The PFR abbreviation (e.g., 'NWE', 'GNB')
   * @returns The standard abbreviation (e.g., 'NE', 'GB')
   */
  toStandard(pfrAbbreviation: string): string {
    const upperAbbr = pfrAbbreviation.toUpperCase();
    return this.mapping[upperAbbr] || upperAbbr;
  }

  /**
   * Maps multiple abbreviations at once
   * @param pfrAbbreviations Array of PFR abbreviations
   * @returns Array of standard abbreviations
   */
  toStandardBatch(pfrAbbreviations: string[]): string[] {
    return pfrAbbreviations.map((abbr) => this.toStandard(abbr));
  }

  /**
   * Checks if an abbreviation needs mapping
   * @param abbreviation The abbreviation to check
   * @returns True if the abbreviation will be mapped to a different value
   */
  needsMapping(abbreviation: string): boolean {
    const upperAbbr = abbreviation.toUpperCase();
    return this.mapping[upperAbbr] !== undefined && this.mapping[upperAbbr] !== upperAbbr;
  }

  /**
   * Gets all supported PFR abbreviations
   * @returns Array of all PFR abbreviations
   */
  getSupportedAbbreviations(): string[] {
    return Object.keys(this.mapping);
  }

  /**
   * Adds a custom mapping
   * @param pfrAbbr Pro Football Reference abbreviation
   * @param standardAbbr Standard abbreviation
   */
  addMapping(pfrAbbr: string, standardAbbr: string): void {
    this.mapping[pfrAbbr.toUpperCase()] = standardAbbr.toUpperCase();
  }
}

/**
 * Default singleton instance
 */
export const teamAbbreviationMapper = new TeamAbbreviationMapper();