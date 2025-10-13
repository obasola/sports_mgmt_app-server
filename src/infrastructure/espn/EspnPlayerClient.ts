// src/infrastructure/espn/EspnPlayerClient.ts
import axios, { AxiosInstance } from 'axios';

export class EspnPlayerClient {
  private http: AxiosInstance;

  constructor(http?: AxiosInstance) {
    this.http =
      http ?? axios.create({ timeout: 15000, headers: { 'User-Agent': 'sports_mgmt_app/1.0' } });
  }

  async listTeams(): Promise<{ items: { $ref: string }[] }> {
    const { data } = await this.http.get(
      'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/teams?limit=1000'
    );
    return data;
  }

  async listTeamAthletes(teamEspnId: number | string): Promise<{ items: any[] }> {
    try {
      // Core API first
      const { data } = await this.http.get(
        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/teams/${teamEspnId}/athletes?limit=1000`
      );
      return data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        // --- Site API fallback ---
        const { data } = await this.http.get(
          `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamEspnId}?enable=roster`
        );

        const maybeRoster = data.team?.athletes ?? [];
        console.log('+++++++++++++++++++++++++');
        console.log('nbr raw athletes:', maybeRoster.length);
        console.log('+++++++++++++++++++++++++');

        const first = maybeRoster[0] || {};
        const isFlat = !!first.id && !!first.fullName;
        const flattened = isFlat
          ? maybeRoster
          : maybeRoster.flatMap((g: any) => g.items ?? g.athletes ?? []);

        console.log('+++++++++++++++++++++++++');
        console.log('flattened:', flattened.length);
        console.log('+++++++++++++++++++++++++');

        return { items: flattened };
      }

      // 👇 fallback for non-404 errors
      throw err;
    }
  }

  async getAthlete(athleteRefOrId: string): Promise<any> {
    const url = athleteRefOrId.startsWith('http')
      ? athleteRefOrId
      : `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes/${athleteRefOrId}`;
    const { data } = await this.http.get(url);
    return data;
  }
}
